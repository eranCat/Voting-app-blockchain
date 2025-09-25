import { ethers } from "ethers";
import * as dotenv from "dotenv";
import fs from "node:fs";
import { resolve } from "node:path";
import artifact from "../../artifacts/contracts/Voting.sol/Voting.json" with { type: "json" };

dotenv.config();

const CONTRACT = "0x0EC7E1D61E4BFB272e55Cfd78fdFa6EF5dFff7BB";

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    const contract = new ethers.Contract(CONTRACT, artifact.abi, wallet);

    // read root from file (relative to project root to avoid __dirname on ESM)
    const rootPath = resolve(process.cwd(), "data/merkle_root.txt");
    const root = fs.readFileSync(rootPath, "utf8").trim();

    // sanity: ensure we are calling a contract (not an EOA)
    const code = await provider.getCode(CONTRACT);
    if (code === "0x") throw new Error("Target address has no code (not a contract).");

    // simulate then send (this catches “onlyOwner” or bad ABI before spending gas)
    await contract.setVoterMerkleRoot.staticCall(root);                 // ethers v6 static simulation
    const tx = await contract.setVoterMerkleRoot(root);
    console.log("setVoterMerkleRoot tx:", tx.hash);
    const rc = await tx.wait();
    console.log("✓ Root set in block", rc?.blockNumber);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
