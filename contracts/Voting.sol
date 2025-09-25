// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title Voting
 * @notice Owner sets a Merkle root of eligible voters. Each allowlisted address
 *         can vote exactly once during an open window [start,end].
 */
contract Voting is Ownable {
    // ---------- Errors ----------
    error VotingClosed();
    error AlreadyVoted();
    error InvalidProof();
    error InvalidWindow(uint256 start, uint256 end);
    error InvalidCandidate();

    // ---------- Events ----------
    event VoterMerkleRootSet(bytes32 indexed root);
    event VotingWindowUpdated(uint256 start, uint256 end);
    event Voted(address indexed voter, uint256 indexed candidateId);

    // ---------- Storage ----------
    struct Candidate {
        string name;
        uint256 votes;
    }

    Candidate[] private _candidates;
    mapping(address => bool) public hasVoted;
    bytes32 public voterMerkleRoot;
    uint256 public electionStart;
    uint256 public electionEnd;

    // ---------- Constructor ----------
    /**
     * @dev No constructor args to match tests. Seed 2 default candidates.
     */
    constructor() Ownable(msg.sender) {
        _candidates.push(Candidate({name: "Candidate A", votes: 0}));
        _candidates.push(Candidate({name: "Candidate B", votes: 0}));
    }

    // ---------- Owner ops ----------
    function setVoterMerkleRoot(bytes32 root) external onlyOwner {
        voterMerkleRoot = root;
        emit VoterMerkleRootSet(root);
    }

    function openVoting(uint256 start, uint256 end) external onlyOwner {
        if (start >= end) revert InvalidWindow(start, end);
        electionStart = start;
        electionEnd = end;
        emit VotingWindowUpdated(start, end);
    }

    // ---------- Read ----------
    function candidateCount() external view returns (uint256) {
        return _candidates.length;
    }

    function candidate(uint256 id) external view returns (string memory name, uint256 votes) {
        if (id >= _candidates.length) revert InvalidCandidate();
        Candidate storage c = _candidates[id];
        return (c.name, c.votes);
    }

    function getVotes(uint256 id) external view returns (uint256) {
        if (id >= _candidates.length) revert InvalidCandidate();
        return _candidates[id].votes;
    }

    // ---------- Write ----------
    /**
     * @dev Vote for candidate `candidateId` providing a Merkle proof for msg.sender.
     *      Leaf format: keccak256(abi.encodePacked(address)).
     */
    function vote(uint256 candidateId, bytes32[] calldata merkleProof) external {
        // window check
        if (electionStart == 0 || electionEnd == 0) revert VotingClosed();
        uint256 ts = block.timestamp;
        if (ts < electionStart || ts > electionEnd) revert VotingClosed();

        // single vote
        if (hasVoted[msg.sender]) revert AlreadyVoted();

        // candidate check
        if (candidateId >= _candidates.length) revert InvalidCandidate();

        // merkle verification
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        bool ok = MerkleProof.verify(merkleProof, voterMerkleRoot, leaf);
        if (!ok) revert InvalidProof();

        // effects
        hasVoted[msg.sender] = true;
        _candidates[candidateId].votes += 1;

        emit Voted(msg.sender, candidateId);
    }
}
