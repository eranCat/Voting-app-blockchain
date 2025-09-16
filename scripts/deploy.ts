import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  const BAL = await ethers.getContractFactory("BALToken");
  const bal = await BAL.deploy();
  await bal.waitForDeployment();

  const reward = ethers.parseUnits("10", 18); // e.g., 10 BAL per vote
  const Voting = await ethers.getContractFactory("Voting");
  const voting = await Voting.deploy(await bal.getAddress(), reward);
  await voting.waitForDeployment();

  await (await bal.setMinter(await voting.getAddress(), true)).wait();

  console.log("BAL:", await bal.getAddress());
  console.log("Voting:", await voting.getAddress());
}

main().catch((e) => { console.error(e); process.exit(1); });
