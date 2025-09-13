"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

// Weather API integration
async function getCurrentWeather(lat: number, lon: number) {
  const url = "https://api.open-meteo.com/v1/forecast";
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "surface_pressure",
      "precipitation",
      "snowfall",
      "cloudcover",
      "cloudcover_high",
      "cloudcover_mid",
      "cloudcover_low",
      "shortwave_radiation",
      "windspeed_10m",
      "winddirection_10m",
      "windspeed_80m",
      "winddirection_80m",
    ].join(","),
    // Include hourly to provide a daylight fallback when current irradiance is 0 (e.g. at night)
    hourly: ["shortwave_radiation", "cloudcover"].join(","),
    timezone: "auto",
  });

  const response = await fetch(`${url}?${params}`);
  const data = await response.json();

  // Defaults from current conditions
  let solarIrradiance: number | null = data.current?.shortwave_radiation ?? null;
  let timestamp: string | null = data.current?.time ?? null;
  let cloudCover: number | null = data.current?.cloudcover ?? null;

  // If current irradiance is zero or missing (night), use the max irradiance in the next 24 hours
  if (!solarIrradiance || solarIrradiance <= 0) {
    const hours: string[] | undefined = data.hourly?.time;
    const swr: number[] | undefined = data.hourly?.shortwave_radiation;
    const cc: number[] | undefined = data.hourly?.cloudcover;

    if (hours && swr && swr.length === hours.length && swr.length > 0) {
      // Look ahead up to 24 hours for the best daylight irradiance
      const nowIdx = hours.findIndex((t) => t === data.current?.time);
      const start = Math.max(0, nowIdx === -1 ? 0 : nowIdx);
      const end = Math.min(swr.length, start + 24);

      let maxIdx = start;
      let maxVal = -Infinity;
      for (let i = start; i < end; i++) {
        if (typeof swr[i] === "number" && swr[i] > maxVal) {
          maxVal = swr[i];
          maxIdx = i;
        }
      }

      if (isFinite(maxVal) && maxVal > 0) {
        solarIrradiance = maxVal;
        timestamp = hours[maxIdx] ?? timestamp;
        cloudCover = (cc && typeof cc[maxIdx] === "number") ? cc[maxIdx] : cloudCover;
      }
    }
  }

  return {
    temperature: data.current?.temperature_2m,
    humidity: data.current?.relative_humidity_2m,
    pressure: data.current?.surface_pressure,
    cloudCover: cloudCover ?? data.current?.cloudcover ?? 0,
    windSpeed: data.current?.windspeed_10m,
    solarIrradiance: typeof solarIrradiance === "number" ? solarIrradiance : 0,
    timestamp: timestamp ?? new Date().toISOString(),
    rawData: data,
  };
}

// Solar geometry calculations (simplified)
function calculateSolarGeometry(lat: number, lon: number, tilt: number, azimuth: number) {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  
  // Simplified solar position calculation
  const declination = 23.45 * Math.sin((360 * (284 + dayOfYear) / 365) * Math.PI / 180);
  const hourAngle = 15 * (now.getHours() - 12);
  
  const zenith = Math.acos(
    Math.sin(lat * Math.PI / 180) * Math.sin(declination * Math.PI / 180) +
    Math.cos(lat * Math.PI / 180) * Math.cos(declination * Math.PI / 180) * Math.cos(hourAngle * Math.PI / 180)
  ) * 180 / Math.PI;
  
  // Simplified angle of incidence calculation
  const angleOfIncidence = Math.acos(
    Math.cos(zenith * Math.PI / 180) * Math.cos(tilt * Math.PI / 180) +
    Math.sin(zenith * Math.PI / 180) * Math.sin(tilt * Math.PI / 180) * Math.cos((azimuth - 180) * Math.PI / 180)
  ) * 180 / Math.PI;
  
  return { zenith, angleOfIncidence };
}

// ML Model prediction (supports simple or advanced)
function predictPowerOutput(features: any, mode: "simple" | "advanced") {
  const {
    temperature,
    humidity,
    solarIrradiance,
    cloudCover,
    zenith,
    angleOfIncidence,
    systemCapacityKw,
  } = features;

  const irradiance = typeof solarIrradiance === "number" ? solarIrradiance : 0;
  const capacity = typeof systemCapacityKw === "number" ? systemCapacityKw : 5;

  // Simple mode: match baseline (no derates)
  if (mode === "simple") {
    return Math.max(0, (irradiance / 1000) * capacity);
  }

  // Advanced mode (existing logic)
  const temp = typeof temperature === "number" ? temperature : 25;
  const cover = typeof cloudCover === "number" ? cloudCover : 0;
  const z = typeof zenith === "number" ? zenith : 90;
  const inc = typeof angleOfIncidence === "number" ? angleOfIncidence : 90;

  let basePower = (irradiance / 1000) * capacity;

  const tempCoeff = 1 - (temp - 25) * 0.004;
  basePower *= Math.max(0.5, tempCoeff);

  basePower *= 1 - (cover / 100) * 0.8;

  const angleEfficiency = Math.max(0, Math.cos((inc * Math.PI) / 180));
  basePower *= angleEfficiency;

  if (z > 85) basePower *= 0.1;
  else if (z > 70) basePower *= 0.5;

  basePower *= 1 - ((typeof humidity === "number" ? humidity : 0) / 100) * 0.1;

  return Math.max(0, basePower);
}

export const predictSolarPower = action({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    tilt: v.number(),
    azimuth: v.number(),
    systemCapacityKw: v.number(),
    userId: v.optional(v.id("users")),
    // Add: calculation mode (optional, default advanced)
    calculationMode: v.optional(v.string()),
    // Optional calibration factor to align results to user's model
    calibrationFactor: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<any> => {
    try {
      const weather = await getCurrentWeather(args.latitude, args.longitude);

      const solarGeometry = calculateSolarGeometry(
        args.latitude,
        args.longitude,
        args.tilt,
        args.azimuth
      );

      const features = {
        temperature: weather.temperature,
        humidity: weather.humidity,
        solarIrradiance: weather.solarIrradiance,
        cloudCover: weather.cloudCover,
        zenith: solarGeometry.zenith,
        angleOfIncidence: solarGeometry.angleOfIncidence,
        systemCapacityKw: args.systemCapacityKw,
        pressure: weather.pressure,
        windSpeed: weather.windSpeed,
      };

      const mode = (args.calculationMode === "simple" ? "simple" : "advanced") as
        | "simple"
        | "advanced";

      const rawPower = predictPowerOutput(features, mode);
      const factor =
        typeof args.calibrationFactor === "number" && isFinite(args.calibrationFactor)
          ? Math.max(0, args.calibrationFactor)
          : 1.0;
      const predictedPower = rawPower * factor;

      const predictionId: any = await ctx.runMutation(
        internal.solarQueries.storePrediction,
        {
          userId: args.userId,
          latitude: args.latitude,
          longitude: args.longitude,
          tilt: args.tilt,
          azimuth: args.azimuth,
          systemCapacityKw: args.systemCapacityKw,
          predictedPowerKw: predictedPower,
          timestamp: weather.timestamp,
          weatherData: {
            temperature: weather.temperature,
            humidity: weather.humidity,
            pressure: weather.pressure,
            cloudCover: weather.cloudCover,
            windSpeed: weather.windSpeed,
            solarIrradiance: weather.solarIrradiance,
          },
          solarGeometry: {
            zenith: solarGeometry.zenith,
            angleOfIncidence: solarGeometry.angleOfIncidence,
          },
        }
      );

      return {
        predictionId,
        predictedPowerKw: predictedPower,
        timestamp: weather.timestamp,
        weatherData: {
          temperature: weather.temperature,
          humidity: weather.humidity,
          pressure: weather.pressure,
          cloudCover: weather.cloudCover,
          windSpeed: weather.windSpeed,
          solarIrradiance: weather.solarIrradiance,
        },
        solarGeometry: {
          zenith: solarGeometry.zenith,
          angleOfIncidence: solarGeometry.angleOfIncidence,
        },
      };
    } catch (error) {
      console.error("Solar prediction error:", error);
      throw new Error("Failed to predict solar power output");
    }
  },
});

export const optimizePanelConfiguration = action({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    currentTilt: v.number(),
    currentAzimuth: v.number(),
    // New: capacity
    systemCapacityKw: v.number(),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args): Promise<any> => {
    try {
      let maxPower = 0;
      let optimalTilt = args.currentTilt;
      let optimalAzimuth = args.currentAzimuth;

      // Test different tilt angles (0-60 degrees)
      for (let tilt = 0; tilt <= 60; tilt += 5) {
        // Test different azimuth angles (120-240 degrees)
        for (let azimuth = 120; azimuth <= 240; azimuth += 10) {
          const weather = await getCurrentWeather(args.latitude, args.longitude);
          const solarGeometry = calculateSolarGeometry(
            args.latitude,
            args.longitude,
            tilt,
            azimuth
          );

          const features = {
            temperature: weather.temperature,
            humidity: weather.humidity,
            solarIrradiance: weather.solarIrradiance,
            cloudCover: weather.cloudCover,
            zenith: solarGeometry.zenith,
            angleOfIncidence: solarGeometry.angleOfIncidence,
            systemCapacityKw: args.systemCapacityKw,
            pressure: weather.pressure,
            windSpeed: weather.windSpeed,
          };

          const power = predictPowerOutput(features, "advanced");

          if (power > maxPower) {
            maxPower = power;
            optimalTilt = tilt;
            optimalAzimuth = azimuth;
          }
        }
      }

      const currentWeather = await getCurrentWeather(
        args.latitude,
        args.longitude
      );
      const currentGeometry = calculateSolarGeometry(
        args.latitude,
        args.longitude,
        args.currentTilt,
        args.currentAzimuth
      );
      const currentFeatures = {
        temperature: currentWeather.temperature,
        humidity: currentWeather.humidity,
        solarIrradiance: currentWeather.solarIrradiance,
        cloudCover: currentWeather.cloudCover,
        zenith: currentGeometry.zenith,
        angleOfIncidence: currentGeometry.angleOfIncidence,
        systemCapacityKw: args.systemCapacityKw,
        pressure: currentWeather.pressure,
        windSpeed: currentWeather.windSpeed,
      };
      const currentPower = predictPowerOutput(currentFeatures, "advanced");

      const improvementPercentage =
        currentPower > 0 ? ((maxPower - currentPower) / currentPower) * 100 : 0;

      const optimizationId: any = await ctx.runMutation(
        internal.solarQueries.storeOptimization,
        {
          userId: args.userId,
          latitude: args.latitude,
          longitude: args.longitude,
          optimalTilt,
          optimalAzimuth,
          maxPowerKw: maxPower,
          currentTilt: args.currentTilt,
          currentAzimuth: args.currentAzimuth,
          currentPowerKw: currentPower,
          improvementPercentage,
        }
      );

      return {
        optimizationId,
        optimalTilt,
        optimalAzimuth,
        maxPowerKw: maxPower,
        currentPowerKw: currentPower,
        improvementPercentage,
      };
    } catch (error) {
      console.error("Optimization error:", error);
      throw new Error("Failed to optimize panel configuration");
    }
  },
});