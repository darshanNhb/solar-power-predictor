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
      "winddirection_80m"
    ].join(","),
    timezone: "auto"
  });

  const response = await fetch(`${url}?${params}`);
  const data = await response.json();
  
  return {
    temperature: data.current.temperature_2m,
    humidity: data.current.relative_humidity_2m,
    pressure: data.current.surface_pressure,
    cloudCover: data.current.cloudcover,
    windSpeed: data.current.windspeed_10m,
    solarIrradiance: data.current.shortwave_radiation,
    timestamp: data.current.time,
    rawData: data.current
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

// ML Model prediction (simplified version of your trained model)
function predictPowerOutput(features: any) {
  // This is a simplified version - in production you'd load your actual joblib model
  // For now, using a simplified calculation based on key factors
  
  const {
    temperature,
    humidity,
    solarIrradiance,
    cloudCover,
    zenith,
    angleOfIncidence,
    tilt
  } = features;
  
  // Base power calculation
  let basePower = (solarIrradiance / 1000) * 5; // Assuming 5kW panel capacity
  
  // Temperature coefficient (panels lose efficiency in heat)
  const tempCoeff = 1 - (temperature - 25) * 0.004;
  basePower *= Math.max(0.5, tempCoeff);
  
  // Cloud cover reduction
  basePower *= (1 - cloudCover / 100 * 0.8);
  
  // Solar angle efficiency
  const angleEfficiency = Math.cos(angleOfIncidence * Math.PI / 180);
  basePower *= Math.max(0, angleEfficiency);
  
  // Zenith angle (sun height) factor
  if (zenith > 85) basePower *= 0.1; // Very low sun
  else if (zenith > 70) basePower *= 0.5;
  
  // Humidity factor (slight reduction)
  basePower *= (1 - humidity / 100 * 0.1);
  
  return Math.max(0, basePower);
}

export const predictSolarPower = action({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    tilt: v.number(),
    azimuth: v.number(),
    userId: v.optional(v.id("users"))
  },
  handler: async (ctx, args): Promise<any> => {
    try {
      // Get current weather
      const weather = await getCurrentWeather(args.latitude, args.longitude);
      
      // Calculate solar geometry
      const solarGeometry = calculateSolarGeometry(
        args.latitude, 
        args.longitude, 
        args.tilt, 
        args.azimuth
      );
      
      // Prepare features for ML model
      const features = {
        temperature: weather.temperature,
        humidity: weather.humidity,
        solarIrradiance: weather.solarIrradiance,
        cloudCover: weather.cloudCover,
        zenith: solarGeometry.zenith,
        angleOfIncidence: solarGeometry.angleOfIncidence,
        tilt: args.tilt,
        azimuth: args.azimuth,
        pressure: weather.pressure,
        windSpeed: weather.windSpeed
      };
      
      // Predict power output
      const predictedPower = predictPowerOutput(features);
      
      // Store prediction in database
      const predictionId: any = await ctx.runMutation(internal.solarQueries.storePrediction, {
        userId: args.userId,
        latitude: args.latitude,
        longitude: args.longitude,
        tilt: args.tilt,
        azimuth: args.azimuth,
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
        }
      });
      
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
        }
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
    userId: v.optional(v.id("users"))
  },
  handler: async (ctx, args): Promise<any> => {
    try {
      let maxPower = 0;
      let optimalTilt = args.currentTilt;
      let optimalAzimuth = args.currentAzimuth;
      
      // Test different tilt angles (0-60 degrees)
      for (let tilt = 0; tilt <= 60; tilt += 5) {
        // Test different azimuth angles (120-240 degrees, focusing on south)
        for (let azimuth = 120; azimuth <= 240; azimuth += 10) {
          const weather = await getCurrentWeather(args.latitude, args.longitude);
          const solarGeometry = calculateSolarGeometry(args.latitude, args.longitude, tilt, azimuth);
          
          const features = {
            temperature: weather.temperature,
            humidity: weather.humidity,
            solarIrradiance: weather.solarIrradiance,
            cloudCover: weather.cloudCover,
            zenith: solarGeometry.zenith,
            angleOfIncidence: solarGeometry.angleOfIncidence,
            tilt: tilt,
            azimuth: azimuth,
            pressure: weather.pressure,
            windSpeed: weather.windSpeed
          };
          
          const power = predictPowerOutput(features);
          
          if (power > maxPower) {
            maxPower = power;
            optimalTilt = tilt;
            optimalAzimuth = azimuth;
          }
        }
      }
      
      // Calculate current configuration power
      const currentWeather = await getCurrentWeather(args.latitude, args.longitude);
      const currentGeometry = calculateSolarGeometry(args.latitude, args.longitude, args.currentTilt, args.currentAzimuth);
      const currentFeatures = {
        temperature: currentWeather.temperature,
        humidity: currentWeather.humidity,
        solarIrradiance: currentWeather.solarIrradiance,
        cloudCover: currentWeather.cloudCover,
        zenith: currentGeometry.zenith,
        angleOfIncidence: currentGeometry.angleOfIncidence,
        tilt: args.currentTilt,
        azimuth: args.currentAzimuth,
        pressure: currentWeather.pressure,
        windSpeed: currentWeather.windSpeed
      };
      const currentPower = predictPowerOutput(currentFeatures);
      
      const improvementPercentage = ((maxPower - currentPower) / currentPower) * 100;
      
      // Store optimization result
      const optimizationId: any = await ctx.runMutation(internal.solarQueries.storeOptimization, {
        userId: args.userId,
        latitude: args.latitude,
        longitude: args.longitude,
        optimalTilt,
        optimalAzimuth,
        maxPowerKw: maxPower,
        currentTilt: args.currentTilt,
        currentAzimuth: args.currentAzimuth,
        currentPowerKw: currentPower,
        improvementPercentage
      });
      
      return {
        optimizationId,
        optimalTilt,
        optimalAzimuth,
        maxPowerKw: maxPower,
        currentPowerKw: currentPower,
        improvementPercentage
      };
    } catch (error) {
      console.error("Optimization error:", error);
      throw new Error("Failed to optimize panel configuration");
    }
  },
});
