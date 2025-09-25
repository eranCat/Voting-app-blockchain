// scripts/admin/set_window.ts
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import artifact from "../../artifacts/contracts/Voting.sol/Voting.json" with { type: "json" };
dotenv.config();
const CONTRACT = "0x0EC7E1D61E4BFB272e55Cfd78fdFa6EF5dFff7BB";

async function main() {
    const p = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const w = new ethers.Wallet(process.env.PRIVATE_KEY!, p);
    const c = new ethers.Contract(CONTRACT, artifact.abi, w);
    const now = Math.floor(Date.now() / 1000);
    const start = BigInt(now - 60), end = BigInt(now + 24 * 60 * 60);
    await c.setElectionWindow.staticCall(start, end);
    const tx = await c.setElectionWindow(start, end);
    console.log("setElectionWindow tx:", tx.hash);
    await tx.wait();
}
main().catch(e => (console.error(e), process.exitCode = 1));
