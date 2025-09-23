import { network } from "hardhat";
import { loadAddresses } from "../utils/addresses.js";

async function main() {
    const { ethers } = await network.connect();
    const { addrs } = await loadAddresses();

    const amount = ethers.parseUnits("10", 18); // change if you like
    const voting = await ethers.getContractAt("Voting", addrs.Voting);
    const tx = await voting.setRewardAmount(amount);
    console.log("setRewardAmount tx:", tx.hash);
    await tx.wait();
    console.log("Done:", amount.toString());
}
main().catch(e => { console.error(e); process.exit(1); });
