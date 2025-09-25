// scripts/vote_from_proofs.ts  (set CANDIDATE_ID based on the lister)
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import fs from "node:fs";
import { resolve } from "node:path";
import artifact from "../artifacts/contracts/Voting.sol/Voting.json" with { type: "json" };
dotenv.config();

const CONTRACT = "0x0EC7E1D61E4BFB272e55Cfd78fdFa6EF5dFff7BB";
const CANDIDATE_ID = 0n;  // pick a real index

const proofs = JSON.parse(fs.readFileSync(resolve("data/proofs/proofs.json"), "utf8")) as Record<string, string[]>;

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    const meLower = (await wallet.getAddress()).toLowerCase();
    const proof = proofs[meLower];
    if (!proof) throw new Error(`No proof for ${meLower}`);

    const c = new ethers.Contract(CONTRACT, artifact.abi, wallet);
    await c["vote(uint256,bytes32[])"].staticCall(CANDIDATE_ID, proof);
    const tx = await c["vote(uint256,bytes32[])"](CANDIDATE_ID, proof);
    console.log("vote tx:", tx.hash);
    await tx.wait();
    console.log("✓ Vote mined");
}
main().catch((e) => (console.error(e), process.exitCode = 1));
