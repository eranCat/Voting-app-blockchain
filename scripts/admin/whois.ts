// scripts/admin/whois.ts
import { network } from "hardhat";
import "dotenv/config";

async function main() {
    const addr = process.env.VOTING_ADDR || process.argv[2];
    if (!addr) throw new Error("Missing VOTING_ADDR");
    const { ethers } = await network.connect();
    const provider = ethers.provider;

    // נסה ERC20 טיפוסי
    const erc20 = new ethers.Contract(addr, [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)"
    ], provider);

    // נסה Voting טיפוסי
    const voting = await ethers.getContractAt("Voting", addr);

    try {
        console.log("ERC20 name:", await erc20.name());
        console.log("ERC20 symbol:", await erc20.symbol());
        console.log("looks like ERC20 (BALToken?)");
    } catch { }

    try {
        const start = await voting.electionStart();
        const end = await voting.electionEnd();
        console.log("Voting window:", start.toString(), end.toString());
        console.log("looks like Voting");
    } catch {
        console.log("Calling Voting getters reverted (likely not Voting).");
    }
}
main().catch(e => { console.error(e); process.exit(1); });
