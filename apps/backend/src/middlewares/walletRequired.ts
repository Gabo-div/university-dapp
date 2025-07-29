import { db } from "@/db";
import { confirmPasswordMidleware } from "./passwordConfirmation";
import { every } from 'hono/combine'
import { wallets } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { decryptMnemonic } from "@/lib/crypt";
import { createMiddleware } from "hono/factory";

export const walletRequiredMiddleware
  = () =>
    createMiddleware<
      {
        Variables: {
          phrase: string
        }
      }
    >(async (_c, _next) => {

      const middleware = every(confirmPasswordMidleware(), async (c, next) => {

        const password = c.var.password

        const user = c.get("user")!

        const wallet = await db
          .select()
          .from(wallets)
          .where(and(eq(wallets.userId, user.id), eq(wallets.active, true)))
          .get();

        if (!wallet) {
          return c.json(
            {
              error: "Wallet not found",
            },
            404,
          );
        }

        const phrase = decryptMnemonic(
          wallet.phrase,
          wallet.salt,
          wallet.iv,
          password,
        );

        c.set('phrase', phrase)

        return next()
      })

      return middleware(_c, _next)
    })
