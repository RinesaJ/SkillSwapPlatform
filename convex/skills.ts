import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("skills")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();
  }
});

export const create = mutation({
  args: {
    type: v.union(v.literal("offer"), v.literal("request")),
    category: v.string(),
    name: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("skills", {
      userId,
      type: args.type,
      category: args.category,
      name: args.name,
      description: args.description,
      status: "active",
    });
  }
});
