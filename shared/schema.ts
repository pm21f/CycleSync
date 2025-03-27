import { pgTable, text, serial, integer, boolean, timestamp, date, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name"),
  dateOfBirth: date("date_of_birth"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  dateOfBirth: true,
});

// Cycle entry schema
export const cycleEntries = pgTable("cycle_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date").notNull(),
  periodFlow: text("period_flow"), // 'none', 'light', 'medium', 'heavy', 'spotting'
  symptoms: json("symptoms").$type<string[]>(), // Array of symptom IDs
  moods: json("moods").$type<string[]>(), // Array of mood IDs
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCycleEntrySchema = createInsertSchema(cycleEntries).pick({
  userId: true,
  date: true,
  periodFlow: true,
  symptoms: true,
  moods: true,
  notes: true,
});

// Cycle prediction schema
export const cyclePredictions = pgTable("cycle_predictions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  periodStartDate: date("period_start_date").notNull(),
  periodEndDate: date("period_end_date").notNull(),
  ovulationDate: date("ovulation_date").notNull(),
  fertileStartDate: date("fertile_start_date").notNull(),
  fertileEndDate: date("fertile_end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCyclePredictionSchema = createInsertSchema(cyclePredictions).pick({
  userId: true,
  periodStartDate: true,
  periodEndDate: true,
  ovulationDate: true,
  fertileStartDate: true,
  fertileEndDate: true,
});

// Resources schema
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // 'article', 'video', 'qa'
  tags: json("tags").$type<string[]>(), // Array of tags
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertResourceSchema = createInsertSchema(resources).pick({
  title: true,
  description: true,
  content: true,
  category: true,
  tags: true,
  imageUrl: true,
});

// Community posts schema
export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tags: json("tags").$type<string[]>(), // Array of tags
  responseCount: integer("response_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCommunityPostSchema = createInsertSchema(communityPosts).pick({
  userId: true,
  title: true,
  content: true,
  tags: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type CycleEntry = typeof cycleEntries.$inferSelect;
export type InsertCycleEntry = z.infer<typeof insertCycleEntrySchema>;

export type CyclePrediction = typeof cyclePredictions.$inferSelect;
export type InsertCyclePrediction = z.infer<typeof insertCyclePredictionSchema>;

export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;

export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
