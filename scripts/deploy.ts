import { network, artifacts } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  // HH3: NetworkConnection doesn't expose .name; use HARDHAT_NETWORK
  const netLabel = process.env.HARDHAT_NETWORK ?? "network";
  console.log(`\n=== Deploying to ${netLabel} ===`);

  // 1) Reuse or deploy token
  let tokenAddr = (process.env.REWARD_TOKEN_ADDRESS || "").trim();
  if (!tokenAddr) {
    const BALToken = await ethers.getContractFactory("BALToken");
    const bal = await BALToken.deploy();
    await bal.waitForDeployment();
    // v6 uses .target
    tokenAddr = (bal as any).target ?? (bal as any).address;
    console.log("BALToken:", tokenAddr);
  } else {
    console.log("BALToken:", tokenAddr);
  }

  // 2) Compute rewardPerVote (if needed)
  let rewardPerVote: bigint | undefined;
  try {
    const dec = await (new ethers.Contract(
      tokenAddr,
      ["function decimals() view returns (uint8)"],
      (await ethers.getSigners())[0]
    )).decimals();
    const human = (process.env.REWARD_PER_VOTE || "10").trim();
    rewardPerVote = ethers.parseUnits(human, dec);
  } catch {
    // ok, might not be needed if constructor is zero-arg
  }

  // 3) Read ABI and decide args
  const abiCtor =
    (await artifacts.readArtifact("Voting")).abi.find((x: any) => x.type === "constructor");
  const argCount = abiCtor?.inputs?.length ?? 0;

  const Voting = await ethers.getContractFactory("Voting");
  const args =
    argCount === 2 ? [tokenAddr, rewardPerVote!] :
      argCount === 0 ? [] :
        (() => { throw new Error(`Unexpected Voting constructor with ${argCount} inputs`); })();

  const voting = await Voting.deploy(...args);
  await voting.waitForDeployment();
  const votingAddr = (voting as any).target ?? (voting as any).address;
  console.log("Voting:", votingAddr);

  console.log("\nSet this for later scripts:");
  console.log(`VOTING_ADDR=${votingAddr}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
