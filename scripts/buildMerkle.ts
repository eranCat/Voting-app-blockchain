// scripts/buildMerkle-oz.ts
import fs from "fs";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

const wl: string[] = JSON.parse(fs.readFileSync("data/whitelist.json", "utf8"));

// leaves as single-field tuples [address] to mirror leaf encoding on-chain
const tree = StandardMerkleTree.of(wl.map(a => [a.toLowerCase()]), ["address"]);
const root = tree.root;
fs.writeFileSync("data/merkle_root.txt", root);

// proofs map
const proofs: Record<string, string[]> = {};
for (const [i, v] of tree.entries()) {
  const addr = (v[0] as string).toLowerCase();
  proofs[addr] = tree.getProof(i);
}
fs.writeFileSync("public/proofs.json", JSON.stringify(proofs, null, 2));
console.log("Merkle Root:", root);
