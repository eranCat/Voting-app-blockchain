// scripts/admin/check_owner.ts
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import artifact from "../../artifacts/contracts/Voting.sol/Voting.json" with { type: "json" };
dotenv.config();
const CONTRACT = "0x0EC7E1D61E4BFB272e55Cfd78fdFa6EF5dFff7BB";
async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    const contract = new ethers.Contract(CONTRACT, artifact.abi, wallet);
    try {
        const owner = await contract.owner();
        console.log("owner():", owner);
    } catch { console.log("owner() reverted (contract may intentionally block some views)."); }
}
main().catch(e => (console.error(e), process.exitCode = 1));
