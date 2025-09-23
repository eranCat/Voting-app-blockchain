import * as fs from "fs/promises";
import * as path from "path";
import { network } from "hardhat";

export type AddressesFile = {
    network: string;
    BAL: string;
    Voting: string;
    rewardPerVote?: string;
    timestamp?: string;
};

export async function loadAddresses(): Promise<{ label: string; addrs: AddressesFile }> {
    // When you run: npx hardhat run ... --network sepolia
    // HARDHAT_NETWORK is set to "sepolia". Your deploy wrote addresses.network.json,
    // so keep the same label logic used by deploy.ts:
    const label = process.env.HARDHAT_NETWORK ?? "network";
    const file = path.join("data", `addresses.${label}.json`);
    const raw = await fs.readFile(file, "utf8");
    const addrs = JSON.parse(raw) as AddressesFile;
    if (!addrs.Voting || !addrs.BAL) {
        throw new Error(`Missing Voting/BAL in ${file}`);
    }

    // Optional safety: confirm Voting address has code
    const { ethers } = await network.connect();
    const code = await ethers.provider.getCode(addrs.Voting);
    if (code === "0x") {
        throw new Error(`No code at Voting address ${addrs.Voting} (file: ${file})`);
    }
    return { label, addrs };
}
