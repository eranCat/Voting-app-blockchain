import { network } from "hardhat";
import "dotenv/config";

async function main() {
    const addr = process.env.VOTING_ADDR || process.argv[2];
    if (!addr) throw new Error("Missing VOTING_ADDR (env) or CLI arg");

    // דוגמה: מתחיל בעוד שעה, נגמר בעוד יומיים
    const now = Math.floor(Date.now() / 1000);
    const start = now + 3600;         // +1h
    const end = now + 2 * 24 * 3600; // +2d

    const { ethers } = await network.connect();
    const voting = await ethers.getContractAt("Voting", addr);

    const tx = await voting.setElectionWindow(start, end);
    console.log("setElectionWindow tx:", tx.hash);
    await tx.wait();
    console.log("✅ Window set:", { start, end });
}
main().catch((e) => { console.error(e); process.exit(1); });
