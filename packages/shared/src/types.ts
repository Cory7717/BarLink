import { z } from "zod";

export const coordinatesSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});
export type Coordinates = z.infer<typeof coordinatesSchema>;

export const offeringSchema = z.object({
  id: z.string(),
  barId: z.string(),
  category: z.string(),
  customTitle: z.string().nullable(),
  description: z.string().nullable(),
  dayOfWeek: z.number(),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  isSpecial: z.boolean().optional().default(false),
  isNew: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([]),
});
export type Offering = z.infer<typeof offeringSchema>;

export const eventSchema = z.object({
  id: z.string(),
  barId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  category: z.string().nullable(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isSpecial: z.boolean().optional().default(false),
  isNew: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  tags: z.array(z.string()).optional().default([]),
});
export type Event = z.infer<typeof eventSchema>;

export const barSearchResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  address: z.string(),
  city: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  todayOfferings: z.array(z.string()),
  hasSpecial: z.boolean().optional(),
  hasNew: z.boolean().optional(),
  distance: z.number().optional(),
});
export type BarSearchResult = z.infer<typeof barSearchResultSchema>;

export const barSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
});
export type BarSummary = z.infer<typeof barSummarySchema>;

export const subscriptionSchema = z.object({
  id: z.string(),
  plan: z.string(),
  status: z.string(),
  currentPeriodEnd: z.string().nullable(),
  cancelAtPeriodEnd: z.boolean().optional().default(false),
});
export type Subscription = z.infer<typeof subscriptionSchema>;

export const ownerProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  phone: z.string().nullable().optional(),
  subscription: subscriptionSchema.nullable().optional(),
});
export type OwnerProfile = z.infer<typeof ownerProfileSchema>;

export const mobileLoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type MobileLoginRequest = z.infer<typeof mobileLoginRequestSchema>;

export const mobileAuthTokenSchema = z.object({
  accessToken: z.string(),
  expiresAt: z.number(), // epoch seconds
});
export type MobileAuthToken = z.infer<typeof mobileAuthTokenSchema>;

export const mobileAuthResponseSchema = z.object({
  token: mobileAuthTokenSchema,
  owner: ownerProfileSchema,
});
export type MobileAuthResponse = z.infer<typeof mobileAuthResponseSchema>;

export const barSearchParamsSchema = z.object({
  day: z.number(),
  activity: z.string(),
  city: z.string().optional(),
  special: z.boolean().optional(),
  happeningNow: z.boolean().optional(),
  distance: z.number().optional(),
  userLatitude: z.number().optional(),
  userLongitude: z.number().optional(),
  q: z.string().optional(),
});
export type BarSearchParams = z.infer<typeof barSearchParamsSchema>;

export const checkInRequestSchema = z.object({
  barId: z.string(),
  qrData: z.string().optional(),
  source: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type CheckInRequest = z.infer<typeof checkInRequestSchema>;
