import { createPublicClient, createWalletClient, http } from "viem";
import { hardhat } from "viem/chains";

export const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(),
  batch: {
    multicall: true,
  },
});

export const walletClient = createWalletClient({
  chain: hardhat,
  transport: http(),
});
