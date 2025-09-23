import { network } from "hardhat";
import * as fs from "fs/promises";
import * as path from "path";
import "dotenv/config";

async function main() {
    const addr = process.env.VOTING_ADDR || process.argv[2];
    if (!addr) throw new Error("Missing VOTING_ADDR (env) or CLI arg");

    const rootPath = path.join("data", "merkle_root.txt");
    const merkleRoot = (await fs.readFile(rootPath, "utf8")).trim();
    if (!/^0x[0-9a-fA-F]{64}$/.test(merkleRoot)) {
        throw new Error(`Bad merkle root: ${merkleRoot}`);
    }

    const { ethers } = await network.connect();
    const voting = await ethers.getContractAt("Voting", addr);

    const tx = await voting.setVoterMerkleRoot(merkleRoot);
    console.log("setVoterMerkleRoot tx:", tx.hash);
    await tx.wait();
    console.log("✅ Merkle root set:", merkleRoot);
}
main().catch((e) => { console.error(e); process.exit(1); });
