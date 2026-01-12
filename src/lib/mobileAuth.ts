import { decode, encode } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

export type MobileJwt = {
  sub: string;
  email: string;
  role?: string;
  exp?: number;
};

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function signMobileJwt(payload: { id: string; email: string; role?: string }, ttlSeconds = DEFAULT_TTL_SECONDS) {
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not set");
  }

  const token = await encode({
    secret,
    token: {
      sub: payload.id,
      email: payload.email,
      role: payload.role ?? "owner",
    },
    maxAge: ttlSeconds,
  });

  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;

  return { token, expiresAt };
}

export async function verifyMobileRequest(request: Request): Promise<MobileJwt | null> {
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not set");
  }

  const header = request.headers.get("authorization");
  if (!header || !header.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  const raw = header.split(" ")[1];
  const decoded = await decode({ token: raw, secret });
  if (!decoded?.sub || !decoded.email) {
    return null;
  }

  return {
    sub: decoded.sub as string,
    email: decoded.email as string,
    role: (decoded as MobileJwt).role ?? "owner",
    exp: decoded.exp,
  };
}
