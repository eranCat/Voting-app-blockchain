// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IBAL { function mint(address to, uint256 amount) external; }

contract Voting is Ownable, ReentrancyGuard {
    struct Candidate { string name; uint8[3] stances; uint256 votes; }

    Candidate[] public candidates;
    mapping(address => bool) public hasVoted;

    bytes32 public voterMerkleRoot;
    uint64 public electionStart;
    uint64 public electionEnd;

    IBAL public bal;
    uint256 public rewardAmount; // BAL per vote

    event CandidateAdded(uint256 id, string name, uint8[3] stances);
    event ElectionWindowSet(uint64 startTs, uint64 endTs);
    event VoterRootSet(bytes32 root);
    event Voted(address indexed voter, uint256 indexed candidateId, bool autoMatched);
    event Rewarded(address indexed voter, uint256 amount);

    constructor(address balToken, uint256 rewardPerVote) Ownable(msg.sender){
        bal = IBAL(balToken);
        rewardAmount = rewardPerVote;
    }

    // --- Admin ---
    function addCandidate(string calldata name, uint8[3] calldata stances) external onlyOwner {
        require(electionStart == 0 || block.timestamp < electionStart, "Election scheduled");
        candidates.push(Candidate({name: name, stances: stances, votes: 0}));
        emit CandidateAdded(candidates.length - 1, name, stances);
    }
    function setVoterMerkleRoot(bytes32 root) external onlyOwner {
        voterMerkleRoot = root; emit VoterRootSet(root);
    }
    function setElectionWindow(uint64 startTs, uint64 endTs) external onlyOwner {
        require(startTs < endTs, "Bad window");
        electionStart = startTs; electionEnd = endTs;
        emit ElectionWindowSet(startTs, endTs);
    }
    function setRewardAmount(uint256 amount) external onlyOwner { rewardAmount = amount; }

    // --- Voting helpers ---
    modifier onlyDuringElection() {
        require(block.timestamp >= electionStart && block.timestamp <= electionEnd, "Not in window");
        _;
    }
    function _verifyVoter(bytes32[] calldata proof, address voter) internal view returns (bool ok) {
        require(voterMerkleRoot != bytes32(0), "Root not set");
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(voter))));
        return MerkleProof.verify(proof, voterMerkleRoot, leaf);
    }
    function _abs(uint8 a, uint8 b) internal pure returns (uint256) { return a > b ? a - b : b - a; }

    // --- Manual vote ---
    function vote(uint256 candidateId, bytes32[] calldata proof) external nonReentrant onlyDuringElection {
        require(candidateId < candidates.length, "Bad candidate");
        require(!hasVoted[msg.sender], "Already voted");
        require(_verifyVoter(proof, msg.sender), "Not whitelisted");
        hasVoted[msg.sender] = true;
        candidates[candidateId].votes += 1;
        if (rewardAmount > 0) { bal.mint(msg.sender, rewardAmount); emit Rewarded(msg.sender, rewardAmount); }
        emit Voted(msg.sender, candidateId, false);
    }

    // --- Auto-match vote ---
    function autoVote(uint8[3] calldata prefs, bytes32[] calldata proof) external nonReentrant onlyDuringElection {
        require(!hasVoted[msg.sender], "Already voted");
        require(_verifyVoter(proof, msg.sender), "Not whitelisted");
        require(candidates.length > 0, "No candidates");
        uint256 bestId = 0; uint256 best = type(uint256).max;
        for (uint256 i = 0; i < candidates.length; i++) {
            uint256 d = _abs(prefs[0], candidates[i].stances[0])
                      + _abs(prefs[1], candidates[i].stances[1])
                      + _abs(prefs[2], candidates[i].stances[2]);
            if (d < best) { best = d; bestId = i; }
        }
        hasVoted[msg.sender] = true;
        candidates[bestId].votes += 1;
        if (rewardAmount > 0) { bal.mint(msg.sender, rewardAmount); emit Rewarded(msg.sender, rewardAmount); }
        emit Voted(msg.sender, bestId, true);
    }

    // --- Results (after end) ---
    function winner() public view returns (uint256 id, string memory name, uint256 votes) {
        require(electionEnd > 0 && block.timestamp > electionEnd, "Not ended");
        require(candidates.length > 0, "No candidates");
        uint256 maxV = 0; uint256 idx = 0;
        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].votes > maxV) { maxV = candidates[i].votes; idx = i; }
        }
        return (idx, candidates[idx].name, candidates[idx].votes);
    }
    function sortedResults() external view returns (Candidate[] memory arr) {
        require(electionEnd > 0 && block.timestamp > electionEnd, "Not ended");
        arr = new Candidate[](candidates.length);
        for (uint256 i = 0; i < candidates.length; i++) arr[i] = candidates[i];
        for (uint256 i = 0; i < arr.length; i++) { // selection sort desc
            uint256 m = i;
            for (uint256 j = i + 1; j < arr.length; j++) if (arr[j].votes > arr[m].votes) m = j;
            if (m != i) { (arr[i], arr[m]) = (arr[m], arr[i]); }
        }
    }
}


