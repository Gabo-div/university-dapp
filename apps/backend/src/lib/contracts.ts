import { publicClient } from "@/lib/viemClients";
import { getContract } from "viem";
import contracts from "@repo/contracts";

export const university = getContract({
  address: contracts.University.address,
  abi: contracts.University.abi,
  client: publicClient,
});

export const priceConsumerV3 = getContract({
  address: contracts.PriceConsumerV3.address,
  abi: contracts.PriceConsumerV3.abi,
  client: publicClient,
});
