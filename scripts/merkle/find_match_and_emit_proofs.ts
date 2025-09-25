import fs from "node:fs";
import { resolve } from "node:path";
import { ethers } from "ethers";

// npm i @openzeppelin/merkle-tree merkletreejs keccak256
import { StandardMerkleTree, SimpleMerkleTree } from "@openzeppelin/merkle-tree";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

// ✅ set this to the ON-CHAIN root you used before
const KNOWN_ROOT = "0x510e4e770828ddbf7f7b00ab00a9f6adaf81c0dc9cc85f1f8249c256942d61d9";

// ✅ your original voter list (one address per line or JSON array of addresses)
const WHITELIST_PATH = resolve("data/whitelist.json"); // ["0xabc...", "..."]

function loadVoters(): string[] {
    const text = fs.readFileSync(WHITELIST_PATH, "utf8");
    const arr = JSON.parse(text) as string[];
    return arr.map(a => ethers.getAddress(a)); // checksum normalize
}

type Found = { name: string; getProof(addr: string): string[] };

function tryStandardOZ(voters: string[]): Found | null {
    // Standard Merkle Tree (double-hash of ABI-encoded values, sorted leaves)
    // Docs: leaves are ABI-encoded, double-hashed, sorted; hash = keccak256. :contentReference[oaicite:1]{index=1}
    const rows = voters.map(a => [a]);
    const tree = StandardMerkleTree.of(rows, ["address"]);
    if (tree.root.toLowerCase() === KNOWN_ROOT.toLowerCase()) {
        return {
            name: "OZ StandardMerkleTree (['address'])",
            getProof(addr: string) {
                for (const [i, [a]] of tree.entries()) {
                    if (ethers.getAddress(String(a)) === ethers.getAddress(addr)) {
                        return tree.getProof(i);
                    }
                }
                throw new Error("address not in tree");
            },
        };
    }
    return null;
}

function trySimpleOZ(voters: string[], hashLeaf: (a: string) => string, sortLeaves = true): Found | null {
    // SimpleMerkleTree represents trees built from custom leaf hashes (single keccak),
    // keeping OZ's pair-hash algorithm but without double-hashing the leaf. :contentReference[oaicite:2]{index=2}
    const leaves = voters.map(hashLeaf);
    const tree = SimpleMerkleTree.of(leaves, { sortLeaves });
    if (tree.root.toLowerCase() === KNOWN_ROOT.toLowerCase()) {
        return {
            name: `OZ SimpleMerkleTree (${sortLeaves ? "sorted" : "unsorted"}) custom leaf-hash`,
            getProof(addr: string) {
                const leaf = hashLeaf(addr);
                return tree.getProof(leaf);
            },
        };
    }
    return null;
}

function tryMerkleTreeJS(voters: string[], leafFn: (a: string) => Buffer, sortPairs: boolean): Found | null {
    // Typical merkletreejs config used in many guides: keccak256 leaves, { sortPairs: true } :contentReference[oaicite:3]{index=3}
    const leaves = voters.map(a => leafFn(a));
    const tree = new MerkleTree(leaves, keccak256 as any, { sortPairs });
    const root = "0x" + tree.getRoot().toString("hex");
    if (root.toLowerCase() === KNOWN_ROOT.toLowerCase()) {
        return {
            name: `merkletreejs (sortPairs=${sortPairs}) with custom leafFn`,
            getProof(addr: string) {
                const leaf = leafFn(addr);
                return tree.getHexProof(leaf);
            },
        };
    }
    return null;
}

function bufFromAddrHex(addr: string) {
    // raw 20-byte address as bytes (no ABI packing)
    return Buffer.from(ethers.getAddress(addr).slice(2), "hex");
}

async function main() {
    const voters = loadVoters();

    const strategies: (() => Found | null)[] = [
        () => tryStandardOZ(voters),

        // --- common "simple" / JS variants (single-hash leaves) ---
        () => trySimpleOZ(voters, a => ethers.keccak256(ethers.solidityPacked(["address"], [a])), true),
        () => trySimpleOZ(voters, a => "0x" + keccak256(bufFromAddrHex(a)).toString("hex"), true),
        () => trySimpleOZ(voters, a => "0x" + keccak256(ethers.getAddress(a)).toString("hex"), true),

        // Unsorted leaves (rare, but try)
        () => trySimpleOZ(voters, a => ethers.keccak256(ethers.solidityPacked(["address"], [a])), false),

        // --- merkletreejs one-hash leaves ---
        () => tryMerkleTreeJS(voters, a => keccak256(ethers.solidityPacked(["address"], [a])), true),
        () => tryMerkleTreeJS(voters, a => keccak256(bufFromAddrHex(a)), true),
        () => tryMerkleTreeJS(voters, a => keccak256(ethers.getAddress(a)), true),
        () => tryMerkleTreeJS(voters, a => keccak256(ethers.solidityPacked(["address"], [a])), false),
    ];

    let found: Found | null = null;
    for (const s of strategies) {
        try {
            found = s();
            if (found) break;
        } catch { }
    }

    if (!found) {
        console.error("❌ No strategy matched KNOWN_ROOT. Fix whitelist or include the exact hashing used originally.");
        process.exit(1);
    }

    console.log("✅ Matched strategy:", found.name);

    // Emit proofs.json (lowercase keys)
    const me = process.env.VOTER ?? ""; // optional: focus one address
    const proofs: Record<string, string[]> = {};
    for (const a of voters) {
        const p = found.getProof(a);
        proofs[a.toLowerCase()] = p as string[];
    }
    fs.mkdirSync(resolve("data/proofs"), { recursive: true });
    fs.writeFileSync(resolve("data/proofs/proofs.json"), JSON.stringify(proofs, null, 2));
    console.log("Wrote data/proofs/proofs.json");

    if (me) {
        console.log("My proof:", proofs[ethers.getAddress(me).toLowerCase()]);
    }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
