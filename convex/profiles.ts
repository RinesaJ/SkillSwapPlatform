import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("profiles")
      .withIndex("by_user", q => q.eq("userId", userId))
      .unique();
  }
});

export const create = mutation({
  args: {
    name: v.string(),
    bio: v.string(),
    location: v.optional(v.string()),
    availability: v.array(v.string()),
    portfolioLinks: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("profiles", {
      userId,
      name: args.name,
      bio: args.bio,
      location: args.location,
      availability: args.availability,
      portfolioLinks: args.portfolioLinks,
    });
  }
});
