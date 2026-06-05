import { pgTable, serial, integer, timestamp, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { collegesTable } from "./colleges";

export const savedCollegesTable = pgTable("saved_colleges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  collegeId: integer("college_id").notNull().references(() => collegesTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const savedComparisonsTable = pgTable("saved_comparisons", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  collegeIds: integer("college_ids").array().notNull(),
  label: text("label").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSavedCollegeSchema = createInsertSchema(savedCollegesTable).omit({ id: true, createdAt: true });
export type InsertSavedCollege = z.infer<typeof insertSavedCollegeSchema>;
export type SavedCollege = typeof savedCollegesTable.$inferSelect;

export const insertSavedComparisonSchema = createInsertSchema(savedComparisonsTable).omit({ id: true, createdAt: true });
export type InsertSavedComparison = z.infer<typeof insertSavedComparisonSchema>;
export type SavedComparison = typeof savedComparisonsTable.$inferSelect;
