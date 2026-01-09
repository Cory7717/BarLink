/**
 * Utility function to log analytics events
 * Call this from API endpoints to track user interactions
 */
export async function logAnalyticsEvent(
  barId: string,
  eventType: "profile_view" | "profile_click" | "search_appear",
  source?: string,
  query?: string
) {
  try {
    const isBrowser = typeof window !== "undefined";
    const baseUrl = isBrowser
      ? ""
      : process.env.NEXTAUTH_URL || process.env.RENDER_EXTERNAL_URL || "";

    if (!isBrowser && !baseUrl) {
      return;
    }

    await fetch(`${baseUrl}/api/analytics/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        barId,
        eventType,
        source: source || eventType,
        query,
      }),
    });
  } catch (error) {
    console.error("Failed to log analytics:", error);
    // Don't throw - logging failures shouldn't break the app
  }
}
