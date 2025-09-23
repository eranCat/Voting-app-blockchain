// scripts/deploy.ts
// Hardhat v3 + Ethers v6 deployment for BALToken + Voting (constructor: address balToken, uint256 rewardPerVote).
// - Uses network.connect() (HH3) to get ethers
// - Deploys BALToken
// - Deploys Voting with (balAddr, rewardPerVote)
// - Writes data/addresses.<network>.json

import { network, artifacts } from "hardhat";
import * as fs from "fs/promises";
import * as path from "path";

function parseReward(): bigint {
  // REWARD_PER_VOTE can be decimal string, interpreted as tokens (18 decimals)
  // e.g. "10" -> 10 * 1e18
  const raw = process.env.REWARD_PER_VOTE?.trim();
  if (!raw) throw new Error("Missing REWARD_PER_VOTE in .env");
  // ethers.parseUnits handles decimals correctly
  return (global as any).ethers
    ? (global as any).ethers.parseUnits(raw, 18)
    : BigInt(0); // will be reassigned after network.connect()
}

async function main() {
  const { ethers } = await network.connect();

  // HH3: NetworkConnection doesn't expose .name; use HARDHAT_NETWORK
  const netLabel = process.env.HARDHAT_NETWORK ?? "network";
  console.log(`\n=== Deploying to ${netLabel} ===`);

  // Read & parse reward now that ethers is available
  const rewardPerVote: bigint = ethers.parseUnits(
    (process.env.REWARD_PER_VOTE || "").trim(),
    18
  );

  // 1) Deploy BALToken (no args)
  const BAL = await ethers.getContractFactory("BALToken");
  const bal = await BAL.deploy();
  await bal.waitForDeployment();
  const balAddr = await bal.getAddress();
  console.log("BALToken:", balAddr);

  // 2) Confirm Voting constructor matches (address, uint256)
  const votingArtifact = await artifacts.readArtifact("Voting");
  const ctor = (votingArtifact.abi as any[]).find((f) => f.type === "constructor");
  const inputs = (ctor?.inputs as any[]) ?? [];
  if (
    inputs.length !== 2 ||
    inputs[0].type !== "address" ||
    inputs[1].type !== "uint256"
  ) {
    throw new Error(
      `Voting constructor mismatch. Expected (address, uint256) but got (${inputs
        .map((i) => i.type)
        .join(", ")}).`
    );
  }

  // 3) Deploy Voting with (balAddr, rewardPerVote)
  const Voting = await ethers.getContractFactory("Voting");
  const voting = await Voting.deploy(balAddr, rewardPerVote);
  await voting.waitForDeployment();
  const votingAddr = await voting.getAddress();
  console.log("Voting  :", votingAddr);

  // 4) Write addresses
  const outDir = path.join("data");
  const outPath = path.join(outDir, `addresses.${netLabel}.json`);
  await fs.mkdir(outDir, { recursive: true });
  const payload = {
    network: netLabel,
    BAL: balAddr,
    Voting: votingAddr,
    rewardPerVote: rewardPerVote.toString(),
    timestamp: new Date().toISOString(),
  };
  await fs.writeFile(outPath, JSON.stringify(payload, null, 2));
  console.log(`\nAddresses written to ${outPath}\n`, payload);

  // 5) Minimal sanity calls
  try {
    const start = await (await ethers.getContractAt("Voting", votingAddr)).electionStart();
    const end = await (await ethers.getContractAt("Voting", votingAddr)).electionEnd();
    console.log(`Voting sanity: window=[${start}, ${end}]`);
  } catch {
    console.log("Voting sanity: getters not callable yet (window not set) — that's fine.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
