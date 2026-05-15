# Voting App Blockchain

A decentralized voting application built on blockchain technology using Ethereum smart contracts. Enables secure, transparent, and tamper-proof voting with TypeScript frontend and Solidity smart contracts.

## 🗳️ Features

- **Decentralized Voting**: Voting logic enforced by smart contracts
- **Immutable Records**: All votes permanently recorded on blockchain
- **Transparent Results**: Real-time vote counting on public ledger
- **Voter Authentication**: Ethereum wallet-based identity verification
- **Prevention of Double Voting**: Smart contract ensures one vote per wallet
- **Multi-Proposal Support**: Vote on multiple proposals simultaneously
- **Admin Controls**: Proposal creation and voting period management
- **Vote Verification**: Participants can verify their vote on blockchain
- **Real-time Results**: Live vote tallying and result updates
- **Gas Optimization**: Efficient smart contract design

## 🛠 Tech Stack

### Frontend
- **Framework**: React, TypeScript
- **Styling**: Tailwind CSS
- **Web3**: Ethers.js
- **State Management**: Redux or Context API
- **Build Tool**: Vite

### Smart Contracts
- **Language**: Solidity 0.8.x
- **Network**: Ethereum (Sepolia testnet / Mainnet)
- **Framework**: Hardhat
- **Testing**: Chai + Hardhat
- **Gas Optimization**: Contract optimization strategies

### Infrastructure
- **Node Provider**: Alchemy, Infura
- **Wallet**: MetaMask
- **IPFS**: Store proposal data (optional)

## 📁 Project Structure

```
voting-app-blockchain/
├── contracts/
│   ├── Voting.sol                      # Main voting contract
│   ├── VotingToken.sol                 # ERC20 governance token
│   ├── VotingFactory.sol               # Factory pattern for multiple votes
│   └── interfaces/
│       └── IVoting.sol
├── test/
│   ├── voting.test.ts
│   ├── voting-token.test.ts
│   └── integration.test.ts
├── scripts/
│   ├── deploy.ts                       # Deployment script
│   ├── setup-proposal.ts               # Initialize proposals
│   └── verify.ts                       # Etherscan verification
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── VotingBoard.tsx
│   │   │   ├── ProposalCard.tsx
│   │   │   ├── Results.tsx
│   │   │   ├── WalletConnect.tsx
│   │   │   └── VoteForm.tsx
│   │   ├── hooks/
│   │   │   ├── useVotingContract.ts
│   │   │   ├── useWallet.ts
│   │   │   └── useVoteData.ts
│   │   ├── services/
│   │   │   ├── contractService.ts
│   │   │   ├── ethersService.ts
│   │   │   └── blockchainListener.ts
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── hardhat.config.ts                   # Hardhat configuration
├── .env.example                        # Environment variables template
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- Hardhat knowledge (optional)
- MetaMask wallet browser extension
- Ethereum testnet funds (Sepolia ETH)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/eranCat/Voting-app-blockchain.git
cd Voting-app-blockchain
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from template:
```bash
cp .env.example .env
```

4. Update `.env` with your credentials:
```env
# Alchemy/Infura RPC URL
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/...

# Private key of deployer account (never share!)
PRIVATE_KEY=0x...

# Etherscan API key for contract verification
ETHERSCAN_API_KEY=...

# Contract address (after deployment)
VOTING_CONTRACT_ADDRESS=0x...
```

### Smart Contract Setup

1. Compile contracts:
```bash
npx hardhat compile
```

2. Run tests:
```bash
npx hardhat test
```

3. Deploy to Sepolia testnet:
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

4. Verify contract on Etherscan:
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_CONTRACT_ADDRESS=0x...
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/...
VITE_NETWORK_ID=11155111
```

4. Start development server:
```bash
npm run dev
```

## 📋 Smart Contract Architecture

### Voting Contract

```solidity
contract Voting {
    struct Proposal {
        uint id;
        string description;
        uint voteCount;
        bool executed;
        uint deadline;
    }
    
    struct Vote {
        address voter;
        uint proposal;
        uint timestamp;
    }
    
    mapping(uint => Proposal) public proposals;
    mapping(address => mapping(uint => bool)) public hasVoted;
    mapping(uint => Vote[]) public votes;
    
    // Events
    event ProposalCreated(uint indexed id, string description);
    event Voted(address indexed voter, uint indexed proposal);
    event ProposalExecuted(uint indexed id);
}
```

### Key Functions

```solidity
// Admin: Create new proposal
function createProposal(string memory description) external onlyAdmin

// Public: Cast vote
function vote(uint proposalId) external

// Public: Get proposal details
function getProposal(uint proposalId) external view returns (Proposal)

// Public: Check vote count
function getVoteCount(uint proposalId) external view returns (uint)

// Admin: Execute approved proposal
function executeProposal(uint proposalId) external onlyAdmin

// Public: Verify if address voted
function hasVoted(address voter, uint proposalId) external view returns (bool)
```

## 🎯 User Flows

### Voter Journey
1. **Connect Wallet** - MetaMask authentication
2. **View Proposals** - Browse active voting proposals
3. **Vote** - Select proposal and submit vote (one vote per wallet)
4. **Verify** - Check vote on blockchain explorer
5. **View Results** - See real-time vote counts

### Admin Journey
1. **Deploy Contract** - Initialize voting system
2. **Create Proposal** - Define voting option
3. **Start Voting** - Set voting period
4. **Monitor Results** - Real-time vote tracking
5. **Execute Decision** - Implement winning proposal

## 💰 Gas Optimization

- Efficient storage patterns (uint32 for timestamps)
- Batch operations where possible
- View/pure functions for queries
- Avoiding unnecessary loops
- Using events for data logging

### Estimated Gas Costs
- Deploy contract: ~2.5M gas
- Create proposal: ~150K gas
- Cast vote: ~80K gas
- Execute proposal: ~200K gas

## 🔐 Security Considerations

### Smart Contract Security
- **Reentrancy Protection**: No external calls in vulnerable states
- **Access Control**: Admin-only functions protected
- **Input Validation**: All parameters validated
- **Integer Overflow**: Uses Solidity 0.8.x checked arithmetic
- **Pull over Push**: Users withdraw funds, not sent to them

### Best Practices
- No private keys in code
- Environment variables for sensitive data
- Contract verification on Etherscan
- Audit of critical contracts recommended
- Multiple signer setup for mainnet

## 🧪 Testing

### Run Test Suite
```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/voting.test.ts

# Run with gas report
REPORT_GAS=true npx hardhat test
```

### Test Coverage
```bash
npx hardhat coverage
```

Expected coverage:
- Statements: 95%+
- Branches: 90%+
- Functions: 95%+
- Lines: 95%+

## 📊 Contract Interactions

### Vote on Proposal
```javascript
const votingContract = new ethers.Contract(
    CONTRACT_ADDRESS,
    VOTING_ABI,
    signer
);

const tx = await votingContract.vote(proposalId);
await tx.wait();
```

### Get Vote Count
```javascript
const voteCount = await votingContract.getVoteCount(proposalId);
console.log(`Votes: ${voteCount}`);
```

### Check if Voted
```javascript
const voted = await votingContract.hasVoted(userAddress, proposalId);
if (voted) {
    console.log("User already voted on this proposal");
}
```

## 🔗 Blockchain Network Details

### Supported Networks
- **Sepolia Testnet**: For development and testing
- **Ethereum Mainnet**: Production deployment
- **Polygon**: Scaling option with lower fees
- **Optimism/Arbitrum**: Layer 2 alternatives

### Network Configuration
```typescript
const networks = {
    sepolia: {
        url: process.env.SEPOLIA_RPC_URL,
        accounts: [process.env.PRIVATE_KEY],
        chainId: 11155111
    },
    mainnet: {
        url: process.env.MAINNET_RPC_URL,
        accounts: [process.env.PRIVATE_KEY],
        chainId: 1
    }
};
```

## 📈 Monitoring & Verification

### Etherscan Integration
- View all transactions
- Verify contract source code
- Monitor gas usage
- Check voting results

### Block Explorer URLs
- Sepolia: https://sepolia.etherscan.io
- Mainnet: https://etherscan.io

### Monitoring Tools
- Alchemy Dashboard for RPC calls
- Etherscan Analytics
- DappRadar for usage metrics

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/NewFeature`
3. Follow code style and conventions
4. Write tests for new features
5. Submit pull request

## 📝 License

MIT License - See [LICENSE](./LICENSE) for details

## 👤 Author

**Eran Karaso** - Blockchain Developer  
GitHub: [@eranCat](https://github.com/eranCat)

## 🔗 Resources

- [Ethereum Documentation](https://ethereum.org/en/developers)
- [Solidity Docs](https://docs.soliditylang.org)
- [Hardhat Documentation](https://hardhat.org)
- [Ethers.js](https://docs.ethers.org)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)

## ⚠️ Disclaimer

This is an educational project. Before deploying to mainnet:
- Conduct thorough security audit
- Test extensively on testnet
- Review all smart contract code
- Implement proper access controls
- Consider insurance coverage

## 🚀 Roadmap

- [ ] DAO governance token integration
- [ ] Multi-chain deployment
- [ ] Delegation of voting rights
- [ ] Time-locked proposals
- [ ] Quadratic voting option
- [ ] IPFS for proposal storage
- [ ] DAO treasury management
- [ ] Multi-sig contract owner