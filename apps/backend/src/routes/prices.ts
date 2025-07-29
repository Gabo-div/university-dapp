import { createHono } from "@/lib/hono";
import { publicClient } from "@/lib/viemClients";
import { priceConsumerV3 } from "@/lib/contracts";

const app = createHono()
  .get("/gas", async (c) => {
    const price = await publicClient.getGasPrice();

    return c.json({ data: { price: price.toString() } });
  })
  .get("/usd", async (c) => {
    const price = await priceConsumerV3.read.getLatestPrice();

    return c.json({ data: { price: price.toString() } });
  });

export default app;
