import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { getOrCreateGitHubUser } from "@/lib/github-user";
import { getGitHubOAuthCredentials } from "@/lib/oauth-config";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        const emailRaw = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!emailRaw || !password) return null;
        const email = emailRaw.trim().toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password) return null;
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          handle: user.handle,
          isAdmin: user.isAdmin,
        };
      },
    }),
    ...(function () {
      const gh = getGitHubOAuthCredentials();
      return gh
        ? [
            GitHub({
              clientId: gh.id,
              clientSecret: gh.secret,
              authorization: { params: { scope: "read:user user:email" } },
            }),
          ]
        : [];
    })(),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "github" && profile && typeof profile === "object") {
        const p = profile as Record<string, unknown>;
        const id = p.id;
        const login = p.login;
        if (
          (typeof id === "number" || typeof id === "string") &&
          typeof login === "string" &&
          login.length > 0
        ) {
          const dbUser = await getOrCreateGitHubUser({
            id,
            login,
            name: typeof p.name === "string" ? p.name : null,
            email: typeof p.email === "string" ? p.email : null,
            avatar_url: typeof p.avatar_url === "string" ? p.avatar_url : null,
          });
          token.sub = dbUser.id;
          token.handle = dbUser.handle;
          token.isAdmin = dbUser.isAdmin;
          token.email = dbUser.email;
          if (dbUser.name) token.name = dbUser.name;
          if (dbUser.image) token.picture = dbUser.image;
        }
        return token;
      }

      if (user) {
        if ("handle" in user && user.handle) token.handle = user.handle as string;
        if ("isAdmin" in user) token.isAdmin = Boolean((user as { isAdmin?: boolean }).isAdmin);
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.handle = (token.handle as string) ?? "";
        session.user.isAdmin = Boolean(token.isAdmin);
        if (typeof token.email === "string") session.user.email = token.email;
        if (typeof token.name === "string") session.user.name = token.name;
        if (typeof token.picture === "string") session.user.image = token.picture;
      }
      return session;
    },
  },
});
