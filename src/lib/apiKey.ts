import { createHash, randomBytes, createCipheriv, createDecipheriv } from "crypto";
import { config } from "@/config";

const secret = createHash("sha256").update(config.sessionSecret).digest();
export const hashKey = (k: string) => createHash("sha256").update(k).digest("hex");

export function encryptKey(plain: string) {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", secret, iv);
  const enc = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return [iv, c.getAuthTag(), enc].map((b) => b.toString("base64")).join(".");
}

export function decryptKey(stored: string): string {
  try {
    const [iv, tag, enc] = stored.split(".").map((x) => Buffer.from(x, "base64"));
    const d = createDecipheriv("aes-256-gcm", secret, iv);
    d.setAuthTag(tag);
    return Buffer.concat([d.update(enc), d.final()]).toString("utf8");
  } catch {
    return "";
  }
}

export function generateApiKey() {
  const key = "vs_" + randomBytes(24).toString("hex");
  return { key, hash: hashKey(key), prefix: key.slice(0, 9), enc: encryptKey(key) };
}
