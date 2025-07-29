import { env } from "@/env";
import { createHono } from "@/lib/hono";
import { walletClient } from "@/lib/viemClients";
import { walletRequiredMiddleware } from "@/middlewares/walletRequired";
import { zValidator } from "@hono/zod-validator";
import { mnemonicToAccount } from "viem/accounts";
import { z } from "zod";

const transactionSchema = z.object({
  blockNumber: z.string(),
  timeStamp: z.string(),
  hash: z.string(),
  nonce: z.string(),
  blockHash: z.string(),
  transactionIndex: z.string(),
  from: z.string(),
  to: z.string(),
  value: z.string(),
  gas: z.string(),
  gasPrice: z.string(),
  isError: z.string(),
  txreceipt_status: z.string(),
  input: z.string(),
  contractAddress: z.string(),
  cumulativeGasUsed: z.string(),
  gasUsed: z.string(),
  confirmations: z.string(),
  methodId: z.string(),
  functionName: z.string(),
});

const app = createHono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        wallet: z.string(),
        page: z.string().optional(),
        offset: z.string().optional(),
      }),
    ),
    async (c) => {
      const { wallet, page, offset } = c.req.valid("query");

      const params = new URLSearchParams({
        apikey: env.ETHERSCAN_APIKEY,
        chainid: "11155111",
        module: "account",
        action: "txlist",
        startblock: "0",
        endblock: "latest",
        sort: "desc",
        address: wallet,
        ...(page ? { page } : {}),
        ...(offset ? { offset } : {}),
      });

      const res = await fetch("https://api.etherscan.io/v2/api?" + params);
      const data = await res.json();

      const parsedData = transactionSchema.array().safeParse(data.result);

      if (!parsedData.success) {
        return c.json(
          {
            data: [],
          },
          200,
        );
      }

      return c.json({
        data: parsedData.data,
      });
    },
  )
  .post(
    "/",
    walletRequiredMiddleware(),
    zValidator(
      "json",
      z.object({
        address: z.string(),
        amount: z.string(),
      }),
    ),
    async (c) => {
      const { address, amount } = c.req.valid("json");
      const phrase = c.get("phrase");

      const account = mnemonicToAccount(phrase);

      const hash = await walletClient.sendTransaction({
        account,
        to: address as `0x${string}`,
        value: BigInt(amount),
      });

      return c.json({
        data: {
          hash,
          address,
        },
      });
    },
  );

export default app;
