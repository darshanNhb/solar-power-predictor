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

export const deletePrediction = mutation({
  args: { id: v.id("predictions") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error("Prediction not found");
    if (doc.userId && doc.userId !== user._id) throw new Error("Forbidden");

    await ctx.db.delete(args.id);
    return null;
  },
});

export const clearUserPredictions = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const q = ctx.db
      .query("predictions")
      .withIndex("by_user", (q) => q.eq("userId", user._id));

    for await (const row of q) {
      await ctx.db.delete(row._id);
    }
    return null;
  },
});