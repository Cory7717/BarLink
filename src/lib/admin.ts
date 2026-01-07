import { auth } from "./auth";

const SUPER_ADMIN = "coryarmer@gmail.com";

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const lower = email.toLowerCase();
  return lower === SUPER_ADMIN || lower.endsWith("@barlink.com");
}

export async function requireAdmin(): Promise<{ email: string }> {
  const session = await auth();
  const email = session?.user?.email || null;
  if (!isAdminEmail(email)) {
    throw new Error("UNAUTHORIZED");
  }
  return { email: email! };
}
