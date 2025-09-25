// scripts/list_candidates.ts
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import artifact from "../artifacts/contracts/Voting.sol/Voting.json" with { type: "json" };
dotenv.config();

const CONTRACT = "0x0EC7E1D61E4BFB272e55Cfd78fdFa6EF5dFff7BB";

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const c = new ethers.Contract(CONTRACT, artifact.abi, provider);

    let found = 0;
    for (let i = 0; i < 50; i++) {
        try {
            const cand = await c.candidates(i);
            console.log(i, cand);
            found++;
        } catch (e) {
            console.log(`stopped at index ${i} (read reverted)`);
            break;
        }
    }
    console.log(`total candidates found: ${found}`);

    try { console.log("winner() →", (await c.winner()).toString()); } catch { }
    try { console.log("sortedResults() →", await c.sortedResults()); } catch { }
}
main().catch((e) => (console.error(e), process.exitCode = 1));
