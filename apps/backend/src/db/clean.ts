import { db } from "./index";
import { userInfo } from "./schema";
import { env } from "@/env";

const cleanDatabase = async () => {
  if (env.NODE_ENV !== "development") {
    console.log("Skipping database cleanup in non-development environment.");
    return;
  }

  console.log("Cleaning database for development...");

  await db.delete(userInfo);

  console.log("Database cleaned for development successfully.");

  return;
};

cleanDatabase().catch((error) => {
  console.error("Error cleaning database:", error);
  process.exit(1);
});
