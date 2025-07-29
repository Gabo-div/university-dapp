import { formatUnits } from "viem";

export const ethToUsd = (usd: number | string, balance: number | string) => {
  const usdPrice = BigInt(usd); // 8 decimals
  const walletBalance = BigInt(balance); // 18 decimals
  const walletBalanceInUSD = (walletBalance * usdPrice) / BigInt(10 ** 18);

  return formatUnits(walletBalanceInUSD, 8);
};
