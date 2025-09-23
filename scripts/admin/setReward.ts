import { network } from "hardhat";
import "dotenv/config";

async function main() {
    const addr = process.env.VOTING_ADDR || process.argv[2];
    if (!addr) throw new Error("Missing VOTING_ADDR (env) or CLI arg");

    const { ethers } = await network.connect();
    const voting = await ethers.getContractAt("Voting", addr);

    const amount = ethers.parseUnits("10", 18); // 10 BAL
    const tx = await voting.setRewardAmount(amount);
    console.log("setRewardAmount tx:", tx.hash);
    await tx.wait();
    console.log("✅ Reward set to:", amount.toString());
}
main().catch((e) => { console.error(e); process.exit(1); });
