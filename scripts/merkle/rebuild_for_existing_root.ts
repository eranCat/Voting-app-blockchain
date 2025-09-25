// scripts/merkle/rebuild_for_existing_root.ts
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { keccak256 } from "ethers";
import fs from "node:fs";
import { resolve } from "node:path";

const KNOWN_ROOT = "0x510e4e770828ddbf7f7b00ab00a9f6adaf81c0dc9cc85f1f8249c256942d61d9"; // on-chain
const voters: string[] = JSON.parse(fs.readFileSync(resolve("data/whitelist.json"), "utf8")); // <- the ORIGINAL list
// StandardMerkleTree expects rows of values; here a single "address" column:
const rows = voters.map(a => [a]);
const tree = StandardMerkleTree.of(rows, ["address"]);
const root = tree.root;
if (root.toLowerCase() !== KNOWN_ROOT.toLowerCase()) {
    throw new Error(`Root mismatch. Computed=${root}, expected(on-chain)=${KNOWN_ROOT}. 
Check voter list, order, and hashing/sorting.`);
}
console.log("✓ Root matches on-chain:", root);

// write per-address proofs (lowercased keys are standard)
const proofs: Record<string, string[]> = {};
for (const [i, [addr]] of tree.entries()) {
    proofs[String(addr).toLowerCase()] = tree.getProof(i);
}
fs.mkdirSync(resolve("data/proofs"), { recursive: true });
fs.writeFileSync(resolve("data/proofs/proofs.json"), JSON.stringify(proofs, null, 2));
console.log("Wrote data/proofs/proofs.json");
