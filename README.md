
# Decentralized Voting DApp

A full-stack decentralized voting application featuring:
- Whitelisted voting using Merkle proofs.
- ERC-20 token rewards for voters.
- Candidate management.
- Time-window for elections.
- A Next.js frontend for interaction.

---

## Technology Stack

- **Smart Contracts**:
  - Solidity
  - Hardhat
  - Ethers.js v6
  - OpenZeppelin Contracts
  - `merkletreejs` & `keccak256` for Merkle tree generation.
- **Frontend**:
  - Next.js
  - React
  - Tailwind CSS
  - Ethers.js v6

---

## Project Structure

```
.
├── contracts/
│   ├── BALToken.sol      # ERC-20 reward token
│   └── Voting.sol        # Main voting contract
├── data/
│   ├── whitelist.json    # List of whitelisted voter addresses
│   ├── merkle_root.txt   # Generated Merkle root
│   └── proofs.json       # Generated proofs (before being moved)
├── frontend/gui/         # Next.js frontend application
│   └── public/
│       └── proofs.json   # Proofs file used by the frontend
├── scripts/
│   ├── buildMerkle.ts    # Script to generate Merkle tree from whitelist
│   └── deploy.ts         # Deployment script for contracts
├── hardhat.config.ts     # Hardhat configuration
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js and npm
- A wallet with funds for deployment and transactions (e.g., MetaMask).

### 1. Installation

Clone the repository and install the dependencies for both the root project and the frontend.

```bash
# Clone the repository
git clone <repository-url>
cd <repository-name>

# Install root dependencies
npm i
npm i -D @nomicfoundation/hardhat-toolbox @openzeppelin/contracts
npm i merkletreejs keccak256

# Install frontend dependencies
cd frontend/gui
npm i
cd ../..
```

> References: OpenZeppelin Merkle utilities, ethers v6 deployment patterns, Hardhat toolbox. 

---

## Contracts

* `contracts/BALToken.sol` — ERC-20 BAL (mintable by Voting contract).
* `contracts/Voting.sol` — admin + whitelist + time window + voting + rewards + results (uses OZ `MerkleProof`).

---

## Configure whitelist & proofs

1. Put voter addresses in `data/whitelist.json` (array of hex addresses).

2. Generate the Merkle artifacts:

```bash
npx ts-node scripts/buildMerkle.ts
```

This writes:

* `data/merkle_root.txt` — paste this root into the contract via `setVoterMerkleRoot(...)`
* `public/proofs.json` — used by the frontend to submit the correct proof

> JS tree builder: `merkletreejs`. (If you prefer typed ergonomics, you can swap to `@openzeppelin/merkle-tree`.)

---

## Compile & Deploy

Set your network in `hardhat.config.*` (RPC + private key), then:

```bash
npx hardhat compile
npx hardhat run scripts/deploy.ts --network <your_network>
```

The deploy script uses ethers **v6** (`waitForDeployment()`, `getAddress()`):

```ts
const BAL = await ethers.getContractFactory("BALToken");
const bal = await BAL.deploy();
await bal.waitForDeployment();
console.log("BAL:", await bal.getAddress());
```

---

## Admin operations (after deploy)

From a script, Hardhat console, or your admin UI:

```ts
// Set Merkle root from data/merkle_root.txt
await voting.setVoterMerkleRoot("0x...");

// Election window (UNIX seconds)
await voting.setElectionWindow(START_TS, END_TS);

// Optional: set reward (BAL per vote)
await voting.setRewardAmount(ethers.parseUnits("10", 18));

// Add candidates (name + 3 stance scores, 0–100)
await voting.addCandidate("Alice", [70, 20, 80]);
await voting.addCandidate("Bob",   [35, 85, 50]);
```

When the window is open:

* Voters call `vote(candidateId, proof)` (manual)
* Or `autoVote([a,b,c], proof)` (system picks closest candidate)

After the window closes:

```ts
await voting.winner();         // (id, name, votes)
await voting.sortedResults();  // array of candidates sorted by votes desc
```

---

## Frontend hook-up (outline)

* Load `public/proofs.json`, match `proofs[userAddress.toLowerCase()]`.
* Show “Vote” buttons **only** if a proof exists for the user.
* Add a countdown to `electionEnd`. Hide vote UI when closed; show `winner()` + `sortedResults()`.

---

## Troubleshooting

**TS2307: Cannot find module 'keccak256' or 'merkletreejs'**

```bash
npm i merkletreejs keccak256
npm i -D ts-node typescript @types/node
```

Then:

```bash
npx ts-node scripts/buildMerkle.ts
# or skip type-checking:
npx ts-node --transpile-only scripts/buildMerkle.ts
```

**Ethers v6 differences**

* Use `await contract.waitForDeployment()` before interacting with a just-deployed contract.
* Use `await contract.getAddress()` to read its address.

**Merkle encoding must match**

* Solidity leaf (in this project): `leaf = keccak256(bytes.concat(keccak256(abi.encode(voter))))`
* Script mirrors that hashing before building the tree.
* If you switch to OZ `StandardMerkleTree(["address"])`, the default is `keccak256(abi.encodePacked(address))` — change the Solidity leaf or JS accordingly. 

---

## Security / gas notes

* **Reentrancy**: protected where rewards mint. (No ETH transfers.)
* **Double vote**: `hasVoted` guard.
* **Sorting**: on-chain selection sort is ok for small N; if you expect many candidates, sort off-chain for the UI.
* **Proof privacy**: proofs reveal allowlist membership; if you need commitment schemes, consider commit-reveal.

---

## Credits

This project started from Daulat Hussain’s public voting DApp starter and was extended to add Merkle allowlist, ERC-20 rewards, auto-vote and result APIs. ([GitHub][5])
