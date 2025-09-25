// scripts/merkle/hunt_root_git.ts
import { execSync } from "node:child_process";
import fs from "node:fs";
import { resolve } from "node:path";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

const KNOWN_ROOT = "0x510e4e770828ddbf7f7b00ab00a9f6adaf81c0dc9cc85f1f8249c256942d61d9";

function commitsForWhitelist() {
    const out = execSync(`git log --pretty=format:%H -- data/whitelist.json`, { stdio: ["ignore", "pipe", "pipe"] }).toString();
    return out.trim().split(/\r?\n/).filter(Boolean);
}

function readWhitelistAt(commit: string): string[] {
    const blob = execSync(`git show ${commit}:data/whitelist.json`, { stdio: ["ignore", "pipe", "pipe"] }).toString();
    return JSON.parse(blob);
}

function tryStandard(list: string[]) {
    // OZ Standard tree: ABI-encoded tuples, sorted leaves, keccak256, double-hash
    const rows = list.map(a => [a]);  // single "address" column
    const tree = StandardMerkleTree.of(rows, ["address"]);
    return tree.root;
}

function writeProofs(list: string[]) {
    const rows = list.map(a => [a]);
    const tree = StandardMerkleTree.of(rows, ["address"]);
    const proofs: Record<string, string[]> = {};
    for (const [i, [addr]] of tree.entries()) {
        proofs[String(addr).toLowerCase()] = tree.getProof(i);
    }
    fs.mkdirSync(resolve("data/proofs"), { recursive: true });
    fs.writeFileSync(resolve("data/proofs/proofs.json"), JSON.stringify(proofs, null, 2));
}

async function main() {
    const commits = commitsForWhitelist();
    for (const sha of commits) {
        try {
            const wl = readWhitelistAt(sha);
            const root = tryStandard(wl);
            if (root.toLowerCase() === KNOWN_ROOT.toLowerCase()) {
                console.log("✓ MATCH at commit:", sha, "root:", root);
                writeProofs(wl);
                console.log("Wrote data/proofs/proofs.json");
                process.exit(0);
            }
        } catch { }
    }
    console.error("❌ Could not find a whitelist.json in history that matches the on-chain root.");
    process.exit(1);
}
main();
