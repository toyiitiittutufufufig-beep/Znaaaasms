import bcrypt from "bcryptjs";
import { db } from "../src/lib/db";
import { generateApiKey } from "../src/lib/apiKey";
import { config } from "../src/config";

async function main() {
  const username = config.admin.username.trim().toLowerCase();
  const exists = await db.user.findUnique({ where: { username } });
  if (!exists) {
    const k = generateApiKey();
    await db.user.create({
      data: {
        username, role: "ADMIN", status: "ACTIVE",
        passwordHash: await bcrypt.hash(config.admin.password, 10),
        apiKeyHash: k.hash, apiKeyPrefix: k.prefix, apiKeyEnc: k.enc,
      },
    });
    console.log("✅ Admin created:", username);
  } else console.log("ℹ️ Admin already exists");
  await db.setting.upsert({ where: { key: "autoDeleteInactive" }, update: {}, create: { key: "autoDeleteInactive", value: "false" } });
  await db.setting.upsert({ where: { key: "inactiveDays" }, update: {}, create: { key: "inactiveDays", value: "7" } });
}
main().finally(() => db.$disconnect());
