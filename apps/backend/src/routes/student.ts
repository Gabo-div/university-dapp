import { createHono } from "@/lib/hono";
import { db } from "@/db";
import { wallets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { university } from "@/lib/contracts";
import { walletRequiredMiddleware } from "@/middlewares/walletRequired";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { mnemonicToAccount } from "viem/accounts";

const app = createHono()
  .get("/:id/subjects", async (c) => {
    const id = c.req.param("id");

    const userWallet = await db
      .select({
        address: wallets.address,
      })
      .from(wallets)
      .where(eq(wallets.userId, id))
      .get();

    if (!userWallet) {
      return c.json({ error: "User wallet not found" }, 404);
    }

    const subjects = await university.read.getUserCurrentSubjects([
      userWallet.address,
    ]);

    return c.json({
      data: subjects,
    });
  })
  .get("/:id/subjects-options", async (c) => {
    const id = c.req.param("id");

    const userWallet = await db
      .select({
        address: wallets.address,
      })
      .from(wallets)
      .where(eq(wallets.userId, id))
      .get();

    if (!userWallet) {
      return c.json({ error: "User wallet not found" }, 404);
    }

    const options = await university.read.getUserSubjectsOptions([
      userWallet.address,
    ]);

    return c.json({
      data: options,
    });
  })
  .post(
    "/register-subjects",
    walletRequiredMiddleware(),
    zValidator(
      "json",
      z.object({
        subjectsId: z.coerce.bigint().array(),
      }),
    ),
    async (c) => {
      const { subjectsId } = c.req.valid("json");
      const phrase = c.get("phrase");

      const account = mnemonicToAccount(phrase);

      await university.write.registerSubjects([subjectsId], {
        account,
      });

      return c.json({ data: { message: "Subjects registered successfully" } });
    },
  );

export default app;
