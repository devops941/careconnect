import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { getEnv } from "../validation/env";
import { authService } from "../services/auth.service";
import { identityResolver } from "./identity-resolver";

const env = getEnv();

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_ID || env.GOOGLE_CLIENT_ID || "",
      clientSecret: env.AUTH_GOOGLE_SECRET || env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: false, // strictly enforce safe verified linking
    }),
    Credentials({
      name: "CareConnect Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const { user } = await authService.loginWithCredentials({
            email: credentials.email as string,
            password: credentials.password as string,
          });

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            identityType: user.identityType,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider === "google") {
        if (!profile?.email || profile.email_verified === false) {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.identityType = (user as any).identityType;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).identityType = token.identityType;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
