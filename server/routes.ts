import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
// import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
// import { registerChatRoutes } from "./replit_integrations/chat";

// Mock isAuthenticated for local dev since we removed Replit Auth
const isAuthenticated = (req: any, res: any, next: any) => {
  // For local dev, attach a mock user
  req.user = { claims: { sub: "local-user-id" } };
  next();
};

// AI Provider Configuration
const AI_PROVIDER = process.env.AI_PROVIDER || "none"; // "openai", "gemini", "deepseek", "groq", "none"

// Initialize AI client based on provider
let aiClient: any = null;

async function getAiClient() {
  if (aiClient) return aiClient;

  if (AI_PROVIDER === "openai" && process.env.OPENAI_API_KEY) {
    const OpenAI = (await import("openai")).default;
    aiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  } else if (AI_PROVIDER === "gemini" && process.env.GEMINI_API_KEY) {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    aiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } else if (AI_PROVIDER === "deepseek" && process.env.DEEPSEEK_API_KEY) {
    const OpenAI = (await import("openai")).default;
    aiClient = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com",
    });
  } else if (AI_PROVIDER === "groq" && process.env.GROQ_API_KEY) {
    const OpenAI = (await import("openai")).default;
    aiClient = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return aiClient;
}

// Helper to fetch a destination or place image from Unsplash
function getUnsplashImageUrl(query: string): string {
  // Use the Unsplash Source API (redirector) or just a direct link construction
  // We clean up the query to be just the main keywords
  const cleanQuery = encodeURIComponent(query.split(',')[0].trim() + " travel scenic");
  return `https://images.unsplash.com/photo-1502791451864-ddca869792ab?w=1600&h=900&fit=crop&q=80&sig=${Math.random()}&dest=${cleanQuery}`;
  // Actually, Unsplash source is deprecated/unreliable, but we can use this trick with search keywords in the URL
}

// Superior Search: High-fidelity image retrieval using Wikipedia REST + Commons
async function fetchImageByQuery(query: string): Promise<string> {
  const clean = query.trim();
  const searchTerms = clean.replace(/\s+/g, ' ');

  const headers = {
    'User-Agent': 'TripSyncTravelBot/2.0 (https://tripsync.example.com; contact@example.com)'
  };

  try {
    // 1. Search Wikipedia with the FULL context
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerms)}&format=json&origin=*`;
    const searchResp = await fetch(searchUrl, { headers });
    const searchData = await searchResp.json();

    if (searchData.query?.search?.length > 0) {
      const title = searchData.query.search[0].title;
      const restUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
      const restResp = await fetch(restUrl, { headers });
      const restData = await restResp.json();
      if (restData.originalimage?.source) return restData.originalimage.source;
    }

    // 2. Tier 2: Search Wikimedia Commons for EXACT photographic matches
    const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerms)}&srnamespace=6&format=json&origin=*`;
    const commResp = await fetch(commonsUrl, { headers });
    const commData = await commResp.json();

    if (commData.query?.search?.length > 0) {
      const fileTitle = commData.query.search[0].title;
      const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
      const iResp = await fetch(infoUrl, { headers });
      const iData = await iResp.json();
      const pId = Object.keys(iData.query.pages)[0];
      if (iData.query.pages[pId].imageinfo?.[0]?.url) return iData.query.pages[pId].imageinfo[0].url;
    }
  } catch (e) {
    console.error(`Surgical fetch failed for ${query}:`, e);
  }

  // 3. Fallback: High-resolution professional travel stock (NO CAT STATUES)
  const hash = query.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const sig = hash % 1000;
  return `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=800&fit=crop&q=80&sig=${sig}`;
}

// AI Generation function that works with multiple providers
async function generateTripWithAI(input: any): Promise<any> {
  const client = await getAiClient();
  if (!client) {
    throw new Error("No AI provider configured. Please check your .env file.");
  }

  const prompt = `
    Generate a structured travel plan for a trip.
    Destination: ${input.destination || "Suggest a destination"}
    Month/Date: ${input.month || input.startDate || "Anytime"}
    Budget: ${input.budget}
    Personality: ${input.personality}
    
    IMPORTANT: Every place in the itinerary MUST follow this exact naming template for accurate image lookup: "Place Name - City, Country" (e.g., "Monal Restaurant - Islamabad, Pakistan").

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
            { "time": "Morning", "place": "Place Name - City", "description": "Short desc", "type": "activity" },
            { "time": "Lunch", "place": "Restaurant Name - City", "description": "Desc", "type": "food" }
          ]
        }
      ],
      "packingSuggestions": [
        { "item": "Item Name", "category": "Category" }
      ]
    }
  `;

  if (AI_PROVIDER === "openai") {
    const response = await aiClient.chat.completions.create({
      model: "gpt-4o-mini", // Cheaper model
      messages: [
        { role: "system", content: "You are a travel assistant. Output JSON only." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
    });
    return JSON.parse(response.choices[0].message.content || "{}");
  } else if (AI_PROVIDER === "gemini") {
    const model = aiClient.getGenerativeModel({ model: "gemini-flash-latest" }); // Use gemini-flash-latest for best compatibility
    const result = await model.generateContent(prompt + "\n\nIMPORTANT: Return ONLY valid JSON, no markdown, no explanation.");
    const text = result.response.text();
    // Remove markdown code blocks if present
    const jsonText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(jsonText);
  } else if (AI_PROVIDER === "deepseek") {
    const response = await aiClient.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are a travel assistant. Output JSON only." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
    });
    return JSON.parse(response.choices[0].message.content || "{}");
  } else if (AI_PROVIDER === "groq") {
    const response = await aiClient.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Free and fast
      messages: [
        { role: "system", content: "You are a travel assistant. Output JSON only." },
        { role: "user", content: prompt }
      ],
    });
    const content = response.choices[0].message.content || "{}";
    // Try to extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : content);
  }

  throw new Error("No AI provider configured");
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // 1. Setup Auth (Mocked for local dev)
  app.get("/api/auth/user", (req, res) => {
    res.json({
      id: "local-user-id",
      email: "local@example.com",
      firstName: "Local",
      lastName: "User",
      profileImageUrl: null
    });
  });

  app.get("/api/login", (req, res) => res.redirect("/"));
  app.get("/api/logout", (req, res) => res.redirect("/"));

  // 2. Setup Chat
  // registerChatRoutes(app);

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
      // Check if AI is configured
      const ai = await getAiClient();
      if (!ai) {
        return res.status(503).json({
          message: `AI trip generation is not available. No AI provider configured. Set AI_PROVIDER environment variable to 'openai', 'gemini', 'deepseek', or 'groq' and provide the corresponding API key.`
        });
      }

      const input = api.trips.generate.input.parse(req.body);
      const userId = (req.user as any).claims.sub;

      // Call AI provider
      const aiData = await generateTripWithAI(input);

      // Fetch destination image
      const coverImage = await fetchImageByQuery(aiData.destination || input.destination);

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
        coverImage,
      });

      // Save Itinerary
      if (aiData.itinerary && Array.isArray(aiData.itinerary)) {
        for (const day of aiData.itinerary) {
          if (day.activities && Array.isArray(day.activities)) {
            for (const act of day.activities) {
              const itemImageUrl = await fetchImageByQuery(`${act.place} - ${aiData.destination || input.destination}`);
              await storage.createItineraryItem({
                tripId: trip.id,
                dayNumber: day.day,
                timeSlot: act.time,
                placeName: act.place,
                description: act.description,
                activityType: act.type,
                imageUrl: itemImageUrl,
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

    // Verify ownership of the packing item via tripId -> userId
    const packingItem = await storage.getPackingItem(id);
    if (!packingItem) {
      return res.status(404).json({ message: "Packing item not found" });
    }

    const trip = await storage.getTrip(packingItem.tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const userId = (req.user as any).claims.sub;
    if (trip.userId !== userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const updated = await storage.togglePackingItem(id, isChecked);
    res.json(updated);
  });

  return httpServer;
}
