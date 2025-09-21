// scripts/deploy.ts
import "dotenv/config";
import hre from "hardhat";
import { ContractFactory, JsonRpcProvider, Wallet } from "ethers";

async function main() {
  const RPC = process.env.SEPOLIA_RPC_URL;
  const PK = process.env.PRIVATE_KEY;

  if (!RPC) throw new Error("Missing SEPOLIA_RPC_URL in .env");
  if (!PK) throw new Error("Missing PRIVATE_KEY in .env");

  // 1) Read compiled artifact via Hardhat (no plugin required)
  const artifact = await hre.artifacts.readArtifact("BALToken"); 

  // 2) Create provider & signer with pure ethers
  const provider = new JsonRpcProvider(RPC);
  const wallet = new Wallet(PK, provider);

  // 3) Deploy
  const factory = new ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const contract = await factory.deploy(/* constructor args if any */);
  await contract.waitForDeployment();

  console.log("Deployed at:", await contract.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
