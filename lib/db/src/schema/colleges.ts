import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const collegesTable = pgTable("colleges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  type: text("type").notNull(), // IIT, NIT, IIIT, Private, Government
  fees: integer("fees").notNull(), // Annual fees in INR
  rating: real("rating").notNull().default(0),
  logoUrl: text("logo_url"),
  shortDescription: text("short_description").notNull(),
  about: text("about"),
  establishedYear: integer("established_year"),
  website: text("website"),
  avgPackage: integer("avg_package"), // LPA
  highestPackage: integer("highest_package"), // LPA
  recruiters: text("recruiters").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCollegeSchema = createInsertSchema(collegesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCollege = z.infer<typeof insertCollegeSchema>;
export type College = typeof collegesTable.$inferSelect;
