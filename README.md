# Voting App - Blockchain

Decentralized voting application built on Ethereum blockchain with smart contracts for transparent, tamper-proof elections.

## Features

- **Smart Contract Voting**: Immutable voting mechanism
- **Blockchain Verification**: All votes recorded on-chain
- **Voter Authentication**: Secure voter identity verification
- **Real-time Results**: Live election results and analytics
- **Multi-choice Elections**: Support various voting systems
- **Transparency**: Public audit trail
- **No Double Voting**: Built-in duplicate prevention
- **Web3 Integration**: MetaMask and wallet support

## Tech Stack

- **Smart Contracts**: Solidity
- **Blockchain**: Ethereum
- **Frontend**: TypeScript + React
- **Web3 Integration**: Ethers.js / Web3.js
- **Testing**: Hardhat + Mocha
- **Deployment**: Hardhat / Truffle

## Smart Contract Architecture

```solidity
contract Voting {
    struct Candidate {
        string name;
        uint256 votes;
    }
    
    struct Election {
        string title;
        uint256 startTime;
        uint256 endTime;
        Candidate[] candidates;
    }
}
```

## Project Structure

```
├── contracts/
│   ├── Voting.sol          # Main voting contract
│   ├── VotingFactory.sol   # Factory pattern
│   └── VoterRegistry.sol   # Voter management
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Pages
│   │   ├── hooks/          # Web3 hooks
│   │   └── services/       # Contract services
├── scripts/                # Deployment scripts
├── test/                   # Contract tests
└── hardhat.config.js       # Hardhat configuration
```

## Getting Started

### Prerequisites

- Node.js 16+
- MetaMask browser extension
- Testnet ETH (Goerli/Sepolia)

### Installation

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy to testnet
npx hardhat run scripts/deploy.js --network goerli

# Start frontend
cd frontend && npm start
```

## Smart Contract Functions

### Voter Functions
```solidity
function vote(uint256 electionId, uint256 candidateId) public
function getVotingStatus() public view returns (bool)
function registerVoter(address voter) public onlyAdmin
```

### Election Functions
```solidity
function createElection(string memory title) public onlyAdmin
function addCandidate(uint256 electionId, string memory name) public onlyAdmin
function getResults(uint256 electionId) public view
function endElection(uint256 electionId) public onlyAdmin
```

## Testing

```bash
# Run contract tests
npx hardhat test

# Gas estimation
npx hardhat test --gas-report

# Coverage
npx hardhat coverage
```

## Deployment

```bash
# Deploy to Goerli testnet
npx hardhat run scripts/deploy.js --network goerli

# Deploy to mainnet (be careful!)
npx hardhat run scripts/deploy.js --network mainnet

# Verify contract on Etherscan
npx hardhat verify --network goerli DEPLOYED_ADDRESS
```

## Frontend Features

### Voter Interface
- Connect MetaMask wallet
- View active elections
- Cast votes
- View personal voting history
- Real-time result updates

### Admin Panel
- Create new elections
- Add candidates
- Monitor voting
- Close elections
- View analytics

### Security Considerations

1. **One-vote-per-address**: Smart contract prevents duplicate voting
2. **Only registered voters**: Voter whitelist required
3. **Time-locked elections**: Cannot vote before/after election period
4. **Immutable audit trail**: All votes logged on blockchain
5. **No vote modification**: Once cast, votes cannot be changed

## Gas Optimization

- Batch voter registration
- Optimized storage layouts
- View-only functions (no gas)
- Efficient candidate storage

## Common Issues

### MetaMask Connection
```javascript
// Request account access
const accounts = await window.ethereum.request({
  method: 'eth_requestAccounts'
});
```

### Network Switching
```javascript
// Switch to Goerli
await window.ethereum.request({
  method: 'wallet_switchEthereumChain',
  params: [{ chainId: '0x5' }],
});
```

## Roadmap

- [ ] DAO governance integration
- [ ] Multi-sig wallet support
- [ ] Advanced voting mechanisms (ranked choice)
- [ ] Mobile app
- [ ] Layer 2 scaling (Polygon)
- [ ] DAO treasury management

## References

- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)

---

**Democratizing voting through blockchain technology** 🗳️⛓️