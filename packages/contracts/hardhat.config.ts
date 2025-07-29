import 'dotenv/config'
import "./tasks"
import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  gasReporter: {
    enabled: true,
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic: process.env.MNEMONIC,
        count: 10,
      },
    },
  }
};

export default config;
