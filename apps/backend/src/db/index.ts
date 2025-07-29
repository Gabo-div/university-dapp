import { drizzle } from "drizzle-orm/libsql";
import { env } from "@/env";

export const db = drizzle({
  connection: {
    url: env.DATABASE_URL,
    authToken: env.DATABASE_TOKEN,
  },
});
