import { NextResponse } from "next/server";
import { COOKIE } from "@/lib/token";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const res = NextResponse.redirect(new URL("/login", req.url));
  res.cookies.delete(COOKIE);
  return res;
}
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE);
  return res;
}
