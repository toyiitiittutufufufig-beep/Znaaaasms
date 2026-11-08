import { NextRequest, NextResponse } from "next/server";
import { readToken, COOKIE } from "@/lib/token";

export async function middleware(req: NextRequest) {
  const s = await readToken(req.cookies.get(COOKIE)?.value);
  const p = req.nextUrl.pathname;
  if (p === "/login")
    return s ? NextResponse.redirect(new URL(s.role === "ADMIN" ? "/admin" : "/dashboard", req.url)) : NextResponse.next();
  if (!s) return NextResponse.redirect(new URL("/login", req.url));
  if (p.startsWith("/admin") && s.role !== "ADMIN") return NextResponse.redirect(new URL("/dashboard", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/history/:path*", "/api-docs/:path*", "/admin/:path*", "/login"],
};
