// hardhat.config.ts
import type { HardhatUserConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import "dotenv/config";

const config: HardhatUserConfig = {
    solidity: "0.8.24",
    networks: {
        hardhat: { type: "edr-simulated", chainType: "l1" },
        sepolia: {
            type: "http",
            chainType: "l1",
            url: process.env.SEPOLIA_RPC_URL!,
            accounts: [process.env.PRIVATE_KEY!],
        },
    },
    plugins: [hardhatEthers],
};
export default config;
