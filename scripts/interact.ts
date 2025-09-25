// scripts/interact.ts
import { ethers } from "ethers";
import * as dotenv from "dotenv";
// ✅ Use your real artifact path (file + contract name)
import artifact from "../artifacts/contracts/Voting.sol/Voting.json" with { type: "json" };

dotenv.config();

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

    const address = "0x0EC7E1D61E4BFB272e55Cfd78fdFa6EF5dFff7BB";
    const contract = new ethers.Contract(address, artifact.abi, wallet);

    console.log("Contract:", await contract.getAddress());
    console.log("Signer:", await wallet.getAddress());

    // 🔎 1) List all functions so you can see the real names & signatures
    const functions = (contract.interface.fragments as any[])
        .filter((f: any) => f.type === "function")
        .map((f: any) => `${f.name}(${f.inputs.map((i: any) => i.type).join(",")})`);
    console.log("Available functions:\n - " + functions.join("\n - "));

    // 🔎 2) Show only those that contain "vote" in their name
    const voteFns = functions.filter((s) => s.toLowerCase().includes("vote"));
    console.log("Vote-like functions:\n - " + (voteFns.join("\n - ") || "(none)"));

    // ✅ 3) Pick the correct one and call it with the right args
    // Examples (uncomment the one that matches your ABI printed above):

    // a) Simple: vote(uint256)
    // await contract["vote(uint256)"].staticCall(1);

    // b) Governor-style: castVote(uint256,uint8) or castVote(uint256,bool)
    // await contract["castVote(uint256,uint8)"].staticCall(1, 1); // 0=Against,1=For,2=Abstain
    // await contract["castVote(uint256,bool)"].staticCall(1, true);

    // c) Merkle-allowlist: vote(uint256,bytes32[])
    // const proof: `0x...`[] = [...]; // build from your voter list
    // await contract["vote(uint256,bytes32[])"].staticCall(1, proof);

    // If staticCall succeeds, send the tx:
    // const tx = await contract;
    // await tx.wait();
    // console.log("Voted tx:", tx.hash);
}

main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
