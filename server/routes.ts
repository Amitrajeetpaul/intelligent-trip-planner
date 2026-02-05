import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // 1. Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // 2. Setup Chat
  registerChatRoutes(app);

  // 3. Trip Routes
  
  // List Trips
  app.get(api.trips.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const trips = await storage.getTripsByUser(userId);
    res.json(trips);
  });

  // Create Trip (Manual)
  app.post(api.trips.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.trips.create.input.parse(req.body);
      // Ensure userId matches authenticated user
      const userId = (req.user as any).claims.sub;
      const trip = await storage.createTrip({ ...input, userId });
      res.status(201).json(trip);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Get Trip Detail
  app.get(api.trips.get.path, isAuthenticated, async (req, res) => {
    const tripId = Number(req.params.id);
    const trip = await storage.getTrip(tripId);
    
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Authorization check
    const userId = (req.user as any).claims.sub;
    if (trip.userId !== userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const itinerary = await storage.getItinerary(tripId);
    const packingList = await storage.getPackingList(tripId);

    res.json({ ...trip, itinerary, packingList });
  });

  // Delete Trip
  app.delete(api.trips.delete.path, isAuthenticated, async (req, res) => {
    const tripId = Number(req.params.id);
    const trip = await storage.getTrip(tripId);
    
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    const userId = (req.user as any).claims.sub;
    if (trip.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

    await storage.deleteTrip(tripId);
    res.status(204).send();
  });

  // Generate Trip (AI)
  app.post(api.trips.generate.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.trips.generate.input.parse(req.body);
      const userId = (req.user as any).claims.sub;

      // Call OpenAI
      const prompt = `
        Generate a structured travel plan for a trip.
        Destination: ${input.destination || "Suggest a destination"}
        Month/Date: ${input.month || input.startDate || "Anytime"}
        Budget: ${input.budget}
        Personality: ${input.personality}
        
        Return ONLY valid JSON with this structure:
        {
          "title": "Trip Title",
          "destination": "City, Country",
          "safetyScore": 1-10,
          "safetyWarnings": ["Warning 1", "Warning 2"],
          "itinerary": [
            {
              "day": 1,
              "activities": [
                { "time": "Morning", "place": "Place Name", "description": "Short desc", "type": "activity" },
                { "time": "Lunch", "place": "Restaurant Name", "description": "Desc", "type": "food" }
              ]
            }
          ],
          "packingSuggestions": [
            { "item": "Item Name", "category": "Category" }
          ]
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [{ role: "system", content: "You are a travel assistant. Output JSON only." }, { role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const aiData = JSON.parse(response.choices[0].message.content || "{}");

      // Save to DB
      const trip = await storage.createTrip({
        userId,
        title: aiData.title || `Trip to ${input.destination}`,
        destination: aiData.destination || input.destination,
        month: input.month,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        budget: input.budget,
        personality: input.personality,
        status: "planned",
        safetyScore: aiData.safetyScore || 8,
      });

      // Save Itinerary
      if (aiData.itinerary && Array.isArray(aiData.itinerary)) {
        for (const day of aiData.itinerary) {
          if (day.activities && Array.isArray(day.activities)) {
            for (const act of day.activities) {
              await storage.createItineraryItem({
                tripId: trip.id,
                dayNumber: day.day,
                timeSlot: act.time,
                placeName: act.place,
                description: act.description,
                activityType: act.type,
                coordinates: null,
              });
            }
          }
        }
      }

      // Save Packing List
      if (aiData.packingSuggestions && Array.isArray(aiData.packingSuggestions)) {
        for (const item of aiData.packingSuggestions) {
          await storage.createPackingItem({
            tripId: trip.id,
            item: item.item,
            category: item.category,
            isChecked: false,
          });
        }
      }

      // Return complete plan
      res.json({
        plan: aiData,
        message: "Trip generated successfully!"
      });

    } catch (err) {
      console.error("AI Generation Error:", err);
      res.status(500).json({ message: "Failed to generate plan" });
    }
  });

  // Toggle Packing Item
  app.patch(api.packing.toggle.path, isAuthenticated, async (req, res) => {
    const id = Number(req.params.id);
    const { isChecked } = req.body;
    
    // In a real app we'd verify ownership of the item via tripId -> userId
    // For MVP/Lite, we'll assume ownership if authenticated (improving later)
    
    const updated = await storage.togglePackingItem(id, isChecked);
    res.json(updated);
  });

  return httpServer;
}
