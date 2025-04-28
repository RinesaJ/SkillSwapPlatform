import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  profiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    bio: v.string(),
    location: v.optional(v.string()),
    availability: v.array(v.string()),
    portfolioLinks: v.array(v.string()),
  }).index("by_user", ["userId"]),

  skills: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("offer"), v.literal("request")),
    category: v.string(),
    name: v.string(),
    description: v.string(),
    status: v.union(v.literal("active"), v.literal("matched"), v.literal("completed")),
  })
    .index("by_user", ["userId"])
    .index("by_category", ["category"]),

  exchanges: defineTable({
    offerId: v.id("skills"),
    requestId: v.id("skills"),
    teacherId: v.id("users"),
    studentId: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("active"), v.literal("completed")),
  })
    .index("by_teacher", ["teacherId"])
    .index("by_student", ["studentId"]),

  messages: defineTable({
    exchangeId: v.id("exchanges"),
    senderId: v.id("users"),
    content: v.string(),
  }).index("by_exchange", ["exchangeId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
