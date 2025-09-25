import { ethers } from "ethers";
import * as dotenv from "dotenv";
import artifact from "../../artifacts/contracts/Voting.sol/Voting.json" with { type: "json" };
dotenv.config();

const CONTRACT = "0x0EC7E1D61E4BFB272e55Cfd78fdFa6EF5dFff7BB";

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider); // MUST be the owner
    const c = new ethers.Contract(CONTRACT, artifact.abi, wallet);

    await c.addCandidate.staticCall("Alice", [1, 2, 3]);           // simulate first (ethers v6)
    const tx = await c.addCandidate("Alice", [1, 2, 3]);
    console.log("addCandidate tx:", tx.hash);
    await tx.wait();
    console.log("✓ Candidate added");
}
main().catch((e) => (console.error(e), process.exitCode = 1));
