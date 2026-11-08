import { SignJWT, jwtVerify } from "jose";
import { config } from "@/config";

const key = new TextEncoder().encode(config.sessionSecret);
export const COOKIE = "session";

export const createToken = (uid: string, role: string) =>
  new SignJWT({ uid, role }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(key);

export async function readToken(t?: string) {
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, key);
    return payload as unknown as { uid: string; role: string };
  } catch {
    return null;
  }
}
