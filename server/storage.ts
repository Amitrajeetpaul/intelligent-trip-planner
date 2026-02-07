import { db } from "./db";
import {
  trips, itineraryItems, packingItems,
  type InsertTrip, type InsertItineraryItem, type InsertPackingItem,
  type Trip, type ItineraryItem, type PackingItem
} from "@shared/schema";
import { eq, desc, asc } from "drizzle-orm";

export interface IStorage {
  // Trips
  createTrip(trip: InsertTrip): Promise<Trip>;
  getTrip(id: number): Promise<Trip | undefined>;
  getTripsByUser(userId: string): Promise<Trip[]>;
  deleteTrip(id: number): Promise<void>;
  updateTrip(id: number, updates: Partial<InsertTrip>): Promise<Trip>;

  // Itinerary
  createItineraryItem(item: InsertItineraryItem): Promise<ItineraryItem>;
  getItinerary(tripId: number): Promise<ItineraryItem[]>;
  deleteItineraryItem(id: number): Promise<void>;

  // Packing
  createPackingItem(item: InsertPackingItem): Promise<PackingItem>;
  getPackingItem(id: number): Promise<PackingItem | undefined>;
  getPackingList(tripId: number): Promise<PackingItem[]>;
  togglePackingItem(id: number, isChecked: boolean): Promise<PackingItem>;
}

export class DatabaseStorage implements IStorage {
  // Trips
  async createTrip(trip: InsertTrip): Promise<Trip> {
    const [newTrip] = await db.insert(trips).values(trip).returning();
    return newTrip;
  }

  async getTrip(id: number): Promise<Trip | undefined> {
    const [trip] = await db.select().from(trips).where(eq(trips.id, id));
    return trip;
  }

  async getTripsByUser(userId: string): Promise<Trip[]> {
    return db.select().from(trips).where(eq(trips.userId, userId)).orderBy(desc(trips.startDate));
  }

  async deleteTrip(id: number): Promise<void> {
    await db.delete(trips).where(eq(trips.id, id));
  }

  async updateTrip(id: number, updates: Partial<InsertTrip>): Promise<Trip> {
    const [updated] = await db.update(trips).set(updates).where(eq(trips.id, id)).returning();
    return updated;
  }

  // Itinerary
  async createItineraryItem(item: InsertItineraryItem): Promise<ItineraryItem> {
    const [newItem] = await db.insert(itineraryItems).values(item).returning();
    return newItem;
  }

  async getItinerary(tripId: number): Promise<ItineraryItem[]> {
    return db.select().from(itineraryItems)
      .where(eq(itineraryItems.tripId, tripId))
      .orderBy(asc(itineraryItems.dayNumber));
  }

  async deleteItineraryItem(id: number): Promise<void> {
    await db.delete(itineraryItems).where(eq(itineraryItems.id, id));
  }

  // Packing
  async createPackingItem(item: InsertPackingItem): Promise<PackingItem> {
    const [newItem] = await db.insert(packingItems).values(item).returning();
    return newItem;
  }

  async getPackingItem(id: number): Promise<PackingItem | undefined> {
    const [item] = await db.select().from(packingItems).where(eq(packingItems.id, id));
    return item;
  }

  async getPackingList(tripId: number): Promise<PackingItem[]> {
    return db.select().from(packingItems).where(eq(packingItems.tripId, tripId));
  }

  async togglePackingItem(id: number, isChecked: boolean): Promise<PackingItem> {
    const [updated] = await db.update(packingItems).set({ isChecked }).where(eq(packingItems.id, id)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
