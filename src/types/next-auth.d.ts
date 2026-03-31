import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      handle: string;
      isAdmin: boolean;
    };
  }

  interface User {
    handle?: string | null;
    isAdmin?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    handle?: string;
    isAdmin?: boolean;
    email?: string;
    picture?: string;
  }
}
