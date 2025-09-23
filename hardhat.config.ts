// hardhat.config.ts
import type { HardhatUserConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import "dotenv/config";

const config: HardhatUserConfig = {
    solidity: "0.8.24",
    networks: {
        hardhat: { type: "edr-simulated", chainType: "l1" },
        sepolia: {
            type: "http",            // ← חובה ב-HH3
            chainType: "l1",
            url: process.env.SEPOLIA_RPC_URL!,
            accounts: [process.env.PRIVATE_KEY!],
        },
    },
    plugins: [hardhatEthers],     // ← רישום ה-plugin ב-HH3
};
export default config;
