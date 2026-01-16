const appId = process.env.ONESIGNAL_APP_ID;
const apiKey = process.env.ONESIGNAL_API_KEY;
const apiUrl = process.env.ONESIGNAL_API_URL || "https://api.onesignal.com";

export async function sendOneSignalNotification(toExternalId: string, title: string, body: string, url?: string) {
  if (!appId || !apiKey) {
    return { ok: false, reason: "ONESIGNAL not configured" };
  }
  try {
    const res = await fetch(`${apiUrl}/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Basic ${apiKey}`,
      },
      body: JSON.stringify({
        app_id: appId,
        include_external_user_ids: [toExternalId],
        channel_for_external_user_ids: "push",
        headings: { en: title },
        contents: { en: body },
        url,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, reason: data?.errors || data?.message || "onesignal failed" };
    }
    return { ok: true, id: data?.id };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "unknown error" };
  }
}
