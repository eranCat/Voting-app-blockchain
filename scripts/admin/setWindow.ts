import { network } from "hardhat";
import { loadAddresses } from "../utils/addresses.js";

async function main() {
    const { ethers } = await network.connect();
    const { addrs } = await loadAddresses();

    const now = Math.floor(Date.now() / 1000);
    const start = now + 3600;        // +1 hour
    const end = now + 2 * 24 * 3600; // +2 days

    const voting = await ethers.getContractAt("Voting", addrs.Voting);
    const tx = await voting.setElectionWindow(start, end);
    console.log("setElectionWindow tx:", tx.hash);
    await tx.wait();
    console.log("Done:", { start, end });
}
main().catch(e => { console.error(e); process.exit(1); });
