import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getUserPredictions = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    
    const predictions = await ctx.db
      .query("predictions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(args.limit || 50);
    
    return predictions;
  },
});

export const getUserOptimizations = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    
    const optimizations = await ctx.db
      .query("optimizations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(args.limit || 10);
    
    return optimizations;
  },
});

export const storePrediction = internalMutation({
  args: {
    userId: v.optional(v.id("users")),
    latitude: v.number(),
    longitude: v.number(),
    tilt: v.number(),
    azimuth: v.number(),
    // Include capacity
    systemCapacityKw: v.number(),
    predictedPowerKw: v.number(),
    timestamp: v.string(),
    weatherData: v.object({
      temperature: v.number(),
      humidity: v.number(),
      pressure: v.number(),
      cloudCover: v.number(),
      windSpeed: v.number(),
      solarIrradiance: v.number(),
    }),
    solarGeometry: v.object({
      zenith: v.number(),
      angleOfIncidence: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("predictions", args);
  },
});

export const storeOptimization = internalMutation({
  args: {
    userId: v.optional(v.id("users")),
    latitude: v.number(),
    longitude: v.number(),
    optimalTilt: v.number(),
    optimalAzimuth: v.number(),
    maxPowerKw: v.number(),
    currentTilt: v.number(),
    currentAzimuth: v.number(),
    currentPowerKw: v.number(),
    improvementPercentage: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("optimizations", args);
  },
});