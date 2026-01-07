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
    await fetch("/api/analytics/log", {
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
