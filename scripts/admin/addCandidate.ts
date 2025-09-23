import { network } from "hardhat";
import "dotenv/config";

async function main() {
    const addr = process.env.VOTING_ADDR || process.argv[2];
    if (!addr) throw new Error("Missing VOTING_ADDR (env) or CLI arg");

    const { ethers } = await network.connect();
    const voting = await ethers.getContractAt("Voting", addr);

    const ops = [
        ["Alice", [70, 20, 80]],
        ["Bob", [35, 85, 50]],
    ] as const;

    for (const [name, scores] of ops) {
        const tx = await voting.addCandidate(name, scores);
        console.log(`addCandidate(${name}) tx:`, tx.hash);
        await tx.wait();
    }
    console.log("✅ Candidates added");
}
main().catch((e) => { console.error(e); process.exit(1); });
