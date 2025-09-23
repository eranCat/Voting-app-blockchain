import { network } from "hardhat";
import "dotenv/config";

async function main() {
    const addr = process.env.VOTING_ADDR || process.argv[2];
    if (!addr) throw new Error("Missing VOTING_ADDR (env) or CLI arg");

    const { ethers } = await network.connect(); // HH3: ethers per NetworkConnection
    const voting = await ethers.getContractAt("Voting", addr);

    const owner = await voting.owner();
    const start = await voting.electionStart();
    const end = await voting.electionEnd();

    console.log("owner:", owner);
    console.log("window:", start.toString(), end.toString());
}
main().catch((e) => { console.error(e); process.exit(1); });
