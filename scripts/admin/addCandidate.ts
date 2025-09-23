import { network } from "hardhat";
import { loadAddresses } from "../utils/addresses.js";

async function main() {
    const { ethers } = await network.connect();
    const { addrs } = await loadAddresses();

    const candidates: Array<[string, [number, number, number]]> = [
        ["Alice", [70, 20, 80]],
        ["Bob", [35, 85, 50]],
    ];

    const voting = await ethers.getContractAt("Voting", addrs.Voting);
    for (const [name, scores] of candidates) {
        const tx = await voting.addCandidate(name, scores);
        console.log(`addCandidate(${name}) tx:`, tx.hash);
        await tx.wait();
    }
    console.log("Done");
}
main().catch(e => { console.error(e); process.exit(1); });
