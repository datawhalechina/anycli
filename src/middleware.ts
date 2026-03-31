import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  if (req.auth) return NextResponse.next();
  const { pathname } = req.nextUrl;
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/publish") ||
    pathname.startsWith("/admin")
  ) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/publish/:path*", "/admin/:path*"],
};
