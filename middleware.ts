import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const path = req.nextUrl.pathname;

  if (path.startsWith("/dashboard")) {
    if (!req.auth) {
      const signIn = new URL("/auth/signin", req.nextUrl.origin);
      signIn.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(signIn);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
