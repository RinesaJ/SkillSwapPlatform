import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    exchangeId: v.id("exchanges"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const exchange = await ctx.db.get(args.exchangeId);
    if (!exchange) throw new Error("Exchange not found");

    // Verify user is part of the exchange
    if (exchange.teacherId !== userId && exchange.studentId !== userId) {
      throw new Error("Not authorized");
    }

    return await ctx.db
      .query("messages")
      .withIndex("by_exchange", q => q.eq("exchangeId", args.exchangeId))
      .collect();
  }
});

export const send = mutation({
  args: {
    exchangeId: v.id("exchanges"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const exchange = await ctx.db.get(args.exchangeId);
    if (!exchange) throw new Error("Exchange not found");

    // Verify user is part of the exchange
    if (exchange.teacherId !== userId && exchange.studentId !== userId) {
      throw new Error("Not authorized");
    }

    return await ctx.db.insert("messages", {
      exchangeId: args.exchangeId,
      senderId: userId,
      content: args.content,
    });
  }
});
