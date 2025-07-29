import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    DATABASE_TOKEN: z.string().optional(),
    ETHERSCAN_APIKEY: z.string(),
    NODE_ENV: z.enum(["development", "production"]),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
