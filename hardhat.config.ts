import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import verify from "@nomicfoundation/hardhat-verify";
import { configVariable, defineConfig } from "hardhat/config";

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin, verify],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    baseSepolia: {
      type: "http",
      url: configVariable("BASE_SEPOLIA_RPC_URL"),
      accounts: [configVariable("PRIVATE_KEY")],
    },
  },
  verify: {
    etherscan: {
      apiKey: configVariable("BASESCAN_API_KEY")
    },
  },
});
