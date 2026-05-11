import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

const googleConfigured =
  Boolean(process.env.AUTH_GOOGLE_ID?.trim()) && Boolean(process.env.AUTH_GOOGLE_SECRET?.trim());

export default {
  trustHost: true,
  providers: [
    ...(googleConfigured
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
            authorization: {
              params: { prompt: "consent", access_type: "offline", response_type: "code" },
            },
          }),
        ]
      : []),
  ],
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider) {
        token.provider = account.provider;
      }
      if (user) {
        token.sub = user.id;
        const r = (user as { role?: unknown }).role;
        token.role = r != null ? String(r) : "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as string) ?? "user";
        if (typeof token.provider === "string") {
          session.user.provider = token.provider;
        }
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
