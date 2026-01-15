export function getBaseUrl() {
  const host =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.RENDER_EXTERNAL_HOSTNAME ||
    process.env.VERCEL_URL;

  if (!host) return "http://localhost:3000";

  return host.startsWith("http") ? host : `https://${host}`;
}
