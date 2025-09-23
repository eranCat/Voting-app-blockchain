import { network } from "hardhat";

async function main() {
    const conn = await network.connect();
    console.log("Has ethers?", Boolean((conn as any).ethers));
}
main();
