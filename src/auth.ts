import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import authConfig from "@/auth.config";
import { normalizeUserRole } from "@/lib/user-roles";

function requireServerSecret(name: string) {
  const value = process.env[name];
  if (!value || value.trim().length < 32) {
    throw new Error(`Missing or weak ${name}. Set a long server-only secret in your environment manager or .env.local.`);
  }
  return value;
}

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? process.env.JWT_SECRET ?? "";

if (!authSecret || authSecret.trim().length < 32) {
  requireServerSecret("AUTH_SECRET");
}

if (process.env.NODE_ENV === "production" && !process.env.NEXTAUTH_URL && !process.env.NEXT_PUBLIC_APP_URL) {
  throw new Error("Missing NEXTAUTH_URL in production. Set it to your HTTPS app URL.");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  secret: authSecret || requireServerSecret("AUTH_SECRET"),
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user || !(await compare(password, user.passwordHash))) return null;

        return { id: user.id, name: user.name, email: user.email, role: normalizeUserRole(user.role) };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      if (user && "role" in user) token.role = normalizeUserRole(user.role);
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = normalizeUserRole(token.role);
      }
      return session;
    },
  },
});
