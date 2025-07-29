import { createHono } from "@/lib/hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "@/db";
import { wallets } from "@/db/schema";
import { mnemonicToAccount } from "viem/accounts";
import { encryptMnemonic } from "@/lib/crypt";
import { confirmPasswordMidleware } from "@/middlewares/passwordConfirmation";

const app = createHono().post(
  "/",
  confirmPasswordMidleware(),
  zValidator("json", z.object({ phrase: z.string() })),
  async (c) => {
    const { phrase } = c.req.valid("json");
    const user = c.get("user")!;
    const password = c.get("password");

    const account = mnemonicToAccount(phrase);
    const encrypted = encryptMnemonic(phrase, password);

    const wallet = await db
      .insert(wallets)
      .values({
        address: account.address,
        phrase: encrypted.encrypted,
        salt: encrypted.salt,
        iv: encrypted.iv,
        userId: user.id,
      })
      .returning()
      .get();

    return c.json({ address: wallet.address });
  },
);

export default app;
