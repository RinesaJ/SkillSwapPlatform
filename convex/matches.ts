import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const findMatches = query({
  args: {
    skillId: v.id("skills"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const skill = await ctx.db.get(args.skillId);
    if (!skill) throw new Error("Skill not found");

    // Find matching skills based on type
    const matchType = skill.type === "offer" ? "request" : "offer";
    const matches = await ctx.db
      .query("skills")
      .withIndex("by_category", q => q.eq("category", skill.category))
      .filter(q => q.eq("type", matchType))
      .filter(q => q.eq("status", "active"))
      .collect();

    // Filter out own skills and get user profiles for matches
    const userProfiles = await Promise.all(
      matches
        .filter(match => match.userId !== userId)
        .map(async match => {
          const profile = await ctx.db
            .query("profiles")
            .withIndex("by_user", q => q.eq("userId", match.userId))
            .unique();
          return { match, profile };
        })
    );

    return userProfiles;
  }
});

export const initiateExchange = mutation({
  args: {
    offerId: v.id("skills"),
    requestId: v.id("skills"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const offer = await ctx.db.get(args.offerId);
    const request = await ctx.db.get(args.requestId);
    if (!offer || !request) throw new Error("Skills not found");

    // Create exchange
    const exchangeId = await ctx.db.insert("exchanges", {
      offerId: args.offerId,
      requestId: args.requestId,
      teacherId: offer.userId,
      studentId: request.userId,
      status: "pending",
    });

    // Update skill statuses
    await ctx.db.patch(args.offerId, { status: "matched" });
    await ctx.db.patch(args.requestId, { status: "matched" });

    return exchangeId;
  }
});
