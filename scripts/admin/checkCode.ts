// scripts/admin/checkCode.ts
import { network } from "hardhat";
import "dotenv/config";

async function main() {
    const addr = process.env.VOTING_ADDR || process.argv[2];
    if (!addr) throw new Error("Missing VOTING_ADDR");
    const { ethers } = await network.connect();
    const code = await ethers.provider.getCode(addr);
    console.log("code length:", code.length, "isContract:", code !== "0x");
}
main();
