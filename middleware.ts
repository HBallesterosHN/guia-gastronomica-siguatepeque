import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { ADMIN_SESSION_COOKIE } from "./lib/admin-session-cookie";
import { verifyAdminSessionToken } from "./lib/admin-session-crypto";

const { auth } = NextAuth(authConfig);

function getAdminSecret(): string | undefined {
  return process.env.ADMIN_SECRET?.trim() || process.env.AUTH_SECRET?.trim();
}

function migrateAdminSessionCookie(
  req: { cookies: { get: (name: string) => { value: string } | undefined } },
  res: NextResponse,
): void {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return;
  const secret = getAdminSecret();
  if (!secret || !verifyAdminSessionToken(secret, token)) return;

  const secure = process.env.NODE_ENV === "production";
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  // Expire legacy path so /api can rely on path=/ only.
  res.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/admin",
    maxAge: 0,
  });
}

export default auth((req) => {
  const path = req.nextUrl.pathname;

  if (path.startsWith("/dashboard")) {
    if (!req.auth) {
      const signIn = new URL("/auth/signin", req.nextUrl.origin);
      signIn.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(signIn);
    }
  }

  const res = NextResponse.next();
  if (path.startsWith("/admin")) {
    migrateAdminSessionCookie(req, res);
  }
  return res;
});

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/admin", "/admin/:path*"],
};
