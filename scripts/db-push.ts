import { execSync } from "child_process";
import { config } from "../src/config";

execSync("npx prisma db push", {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: config.databaseUrl },
});
