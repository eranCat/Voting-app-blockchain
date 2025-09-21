import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";

const { SEPOLIA_RPC_URL, PRIVATE_KEY } = process.env;
if (!SEPOLIA_RPC_URL) throw new Error("Missing SEPOLIA_RPC_URL in .env");
if (!PRIVATE_KEY) throw new Error("Missing PRIVATE_KEY in .env");

const config: HardhatUserConfig = {
    solidity: "0.8.24",
    networks: {
        sepolia: {
            type: "http",
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
        },
    },
};

export default config;
