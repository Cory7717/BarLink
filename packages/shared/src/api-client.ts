import { z } from "zod";
import {
  barSearchParamsSchema,
  barSearchResultSchema,
  BarSearchParams,
  BarSearchResult,
  CheckInRequest,
  checkInRequestSchema,
  MobileAuthResponse,
  mobileAuthResponseSchema,
  MobileLoginRequest,
  mobileLoginRequestSchema,
  ownerProfileSchema,
  OwnerProfile,
  BarSummary,
  barSummarySchema,
} from "./types";

export type ApiClientConfig = {
  baseUrl: string;
  getToken?: () => Promise<string | null> | string | null;
};

type RequestOptions = RequestInit & { skipAuth?: boolean };

function assertBaseUrl(url: string) {
  if (!url.startsWith("http")) {
    throw new Error("API baseUrl must include protocol (e.g. https://api.example.com)");
  }
}

export class BarLink360ApiClient {
  private baseUrl: string;
  private getToken?: ApiClientConfig["getToken"];

  constructor(config: ApiClientConfig) {
    assertBaseUrl(config.baseUrl);
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.getToken = config.getToken;
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set("Accept", "application/json");
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (!options.skipAuth && this.getToken) {
      const token = await this.getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;
      try {
        const body = await response.json();
        message = body?.error || message;
      } catch {
        // ignore parse errors
      }
      throw new Error(message);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  async login(payload: MobileLoginRequest): Promise<MobileAuthResponse> {
    const body = mobileLoginRequestSchema.parse(payload);
    const data = await this.request("/api/mobile/login", {
      method: "POST",
      body: JSON.stringify(body),
      skipAuth: true,
    });
    return mobileAuthResponseSchema.parse(data);
  }

  async refresh(): Promise<MobileAuthResponse> {
    const data = await this.request("/api/mobile/refresh", {
      method: "POST",
    });
    return mobileAuthResponseSchema.parse(data);
  }

  async me(): Promise<OwnerProfile> {
    const data = await this.request("/api/mobile/me");
    return ownerProfileSchema.parse(data);
  }

  async searchBars(params: BarSearchParams): Promise<BarSearchResult[]> {
    const parsed = barSearchParamsSchema.parse(params);
    const query = new URLSearchParams();
    query.set("day", parsed.day.toString());
    query.set("activity", parsed.activity);
    if (parsed.city) query.set("city", parsed.city);
    if (parsed.special !== undefined) query.set("special", String(parsed.special));
    if (parsed.happeningNow !== undefined) query.set("happeningNow", String(parsed.happeningNow));
    if (parsed.distance !== undefined) query.set("distance", parsed.distance.toString());
    if (parsed.userLatitude !== undefined) query.set("userLatitude", parsed.userLatitude.toString());
    if (parsed.userLongitude !== undefined) query.set("userLongitude", parsed.userLongitude.toString());
    if (parsed.q) query.set("q", parsed.q);

    const data = await this.request<{ bars: unknown }>(`/api/search?${query.toString()}`, {
      method: "GET",
      skipAuth: true,
    });
    const bars = z.array(barSearchResultSchema).parse((data as { bars: unknown }).bars);
    return bars;
  }

  async ownerBars(): Promise<BarSummary[]> {
    const data = await this.request<{ bars: unknown }>("/api/mobile/bars");
    return z.array(barSummarySchema).parse(data.bars);
  }

  async checkIn(payload: CheckInRequest) {
    const body = checkInRequestSchema.parse(payload);
    return this.request("/api/checkin", {
      method: "POST",
      body: JSON.stringify(body),
      skipAuth: true, // anonymous check-ins allowed
    });
  }
}

export function createApiClient(config: ApiClientConfig) {
  return new BarLink360ApiClient(config);
}
