import { createHmac, timingSafeEqual } from "node:crypto";

const HMAC_MESSAGE = "restaurantes-sigua-admin-v1";

export function createAdminSessionToken(adminSecret: string): string {
  return createHmac("sha256", adminSecret).update(HMAC_MESSAGE).digest("base64url");
}

export function verifyAdminSessionToken(adminSecret: string, cookieValue: string | undefined): boolean {
  if (!adminSecret || !cookieValue) return false;
  try {
    const expected = createAdminSessionToken(adminSecret);
    const a = Buffer.from(cookieValue, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
