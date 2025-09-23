import { network } from "hardhat";
import * as fs from "fs/promises";
import * as path from "path";
import { loadAddresses } from "../utils/addresses.js";

async function main() {
    const { ethers } = await network.connect();
    const { addrs } = await loadAddresses();

    const merkleRoot = (await fs.readFile(path.join("data", "merkle_root.txt"), "utf8")).trim();
    if (!/^0x[0-9a-fA-F]{64}$/.test(merkleRoot)) throw new Error(`Bad merkle root: ${merkleRoot}`);

    const voting = await ethers.getContractAt("Voting", addrs.Voting);
    const tx = await voting.setVoterMerkleRoot(merkleRoot);
    console.log("setVoterMerkleRoot tx:", tx.hash);
    await tx.wait();
    console.log("Done:", merkleRoot);
}
main().catch(e => { console.error(e); process.exit(1); });
