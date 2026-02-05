import { z } from 'zod';
import { insertTripSchema, trips, itineraryItems, packingItems, insertItineraryItemSchema, insertPackingItemSchema } from './schema';

// Shared error schemas
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  trips: {
    list: {
      method: 'GET' as const,
      path: '/api/trips',
      responses: {
        200: z.array(z.custom<typeof trips.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/trips',
      input: insertTripSchema,
      responses: {
        201: z.custom<typeof trips.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/trips/:id',
      responses: {
        200: z.custom<typeof trips.$inferSelect & { itinerary: typeof itineraryItems.$inferSelect[]; packingList: typeof packingItems.$inferSelect[] }>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/trips/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    generate: {
      method: 'POST' as const,
      path: '/api/trips/generate',
      input: z.object({
        destination: z.string().optional(),
        month: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        budget: z.string(),
        personality: z.string(),
      }),
      responses: {
        200: z.object({
          plan: z.custom<any>(), // AIGeneratedPlan structure
          message: z.string(),
        }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
  packing: {
    toggle: {
      method: 'PATCH' as const,
      path: '/api/packing/:id',
      input: z.object({ isChecked: z.boolean() }),
      responses: {
        200: z.custom<typeof packingItems.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
  itinerary: {
    create: {
      method: 'POST' as const,
      path: '/api/trips/:id/itinerary',
      input: insertItineraryItemSchema,
      responses: {
        201: z.custom<typeof itineraryItems.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type TripResponse = z.infer<typeof api.trips.create.responses[201]>;
export type TripListResponse = z.infer<typeof api.trips.list.responses[200]>;
export type TripDetailResponse = z.infer<typeof api.trips.get.responses[200]>;
export type GeneratePlanInput = z.infer<typeof api.trips.generate.input>;
