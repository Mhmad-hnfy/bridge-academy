import { NextResponse } from "next/server";
import { verifyCookieValue } from "./lib/auth";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // ─── Protect /admin/* routes ────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const roleCookie = request.cookies.get("fahem_role")?.value;
    const verifiedRole = await verifyCookieValue(roleCookie);
    
    if (verifiedRole !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

