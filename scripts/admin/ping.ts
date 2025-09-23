import { network } from "hardhat";
import { loadAddresses } from "../utils/addresses.js";


async function main() {
    const { ethers } = await network.connect();
    const { addrs } = await loadAddresses();

    const voting = await ethers.getContractAt("Voting", addrs.Voting);
    const [owner, start, end] = await Promise.all([
        voting.owner(),
        voting.electionStart(),
        voting.electionEnd(),
    ]);

    console.log("Voting:", addrs.Voting);
    console.log("Owner:", owner);
    console.log("Window:", start.toString(), end.toString());
}
main().catch(e => { console.error(e); process.exit(1); });
