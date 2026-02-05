import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Export Auth & Chat models as required by blueprints
export * from "./models/auth";
export * from "./models/chat";

import { users } from "./models/auth";

// --- Trips Table ---
export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Links to users.id (which is varchar)
  title: text("title").notNull(),
  destination: text("destination"), // Can be null if "Month only" mode initially
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  month: text("month"), // For flexible month planning (e.g., "September 2025")
  budget: text("budget"), // e.g., "Low", "Medium", "High" or specific amount
  personality: text("personality").notNull().default("adventure"), // "budget", "adventure", "family"
  status: text("status").notNull().default("draft"), // "draft", "planned", "completed"
  safetyScore: integer("safety_score").default(10), // 1-10
  createdAt: timestamp("created_at").defaultNow(),
});

export const tripsRelations = relations(trips, ({ one, many }) => ({
  itinerary: many(itineraryItems),
  packingList: many(packingItems),
}));

// --- Itinerary Items ---
export const itineraryItems = pgTable("itinerary_items", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull(),
  dayNumber: integer("day_number").notNull(), // Day 1, Day 2...
  timeSlot: text("time_slot"), // "Morning", "10:00 AM", etc.
  placeName: text("place_name").notNull(),
  description: text("description"),
  activityType: text("activity_type"), // "activity", "food", "transport", "hotel"
  coordinates: jsonb("coordinates"), // { lat: number, lng: number } for map
});

export const itineraryRelations = relations(itineraryItems, ({ one }) => ({
  trip: one(trips, {
    fields: [itineraryItems.tripId],
    references: [trips.id],
  }),
}));

// --- Packing List ---
export const packingItems = pgTable("packing_items", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull(),
  item: text("item").notNull(),
  category: text("category").default("general"), // "clothing", "electronics", "documents"
  isChecked: boolean("is_checked").default(false),
});

export const packingRelations = relations(packingItems, ({ one }) => ({
  trip: one(trips, {
    fields: [packingItems.tripId],
    references: [trips.id],
  }),
}));

// --- Zod Schemas ---
export const insertTripSchema = createInsertSchema(trips).omit({ id: true, createdAt: true, safetyScore: true });
export const insertItineraryItemSchema = createInsertSchema(itineraryItems).omit({ id: true });
export const insertPackingItemSchema = createInsertSchema(packingItems).omit({ id: true });

// --- Types ---
export type Trip = typeof trips.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type ItineraryItem = typeof itineraryItems.$inferSelect;
export type InsertItineraryItem = z.infer<typeof insertItineraryItemSchema>;
export type PackingItem = typeof packingItems.$inferSelect;
export type InsertPackingItem = z.infer<typeof insertPackingItemSchema>;

// --- API Request Types ---
export type CreateTripRequest = InsertTrip;
export type UpdateTripRequest = Partial<InsertTrip>;
export type GeneratePlanRequest = {
  destination?: string;
  month?: string;
  startDate?: string;
  endDate?: string;
  budget: string;
  personality: string; // "budget" | "adventure" | "family"
  startingLocation?: string; // Optional for transport suggestions
};

export type AIGeneratedPlan = {
  title: string;
  destination: string;
  safetyScore: number;
  safetyWarnings: string[];
  itinerary: {
    day: number;
    activities: {
      time: string;
      place: string;
      description: string;
      type: "activity" | "food" | "transport";
    }[];
  }[];
  packingSuggestions: { item: string; category: string }[];
};
