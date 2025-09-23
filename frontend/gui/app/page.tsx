/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { votingAbi } from './abis/Voting';

import { useConnect, useDisconnect } from 'wagmi';

const VOTING_ADDR = process.env.NEXT_PUBLIC_VOTING_ADDRESS as `0x${string}`;

type Candidate = { name: string; stances: [number, number, number]; votes: bigint };

export default function Page() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [candidateCount, setCandidateCount] = useState<number>(0);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [proofs, setProofs] = useState<Record<string, string[]>>({});

  const { connect, connectors, status: connectStatus } = useConnect();
  const { disconnect } = useDisconnect();

  // Fetch proofs.json from /public (served at /proofs.json)
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/proofs.json');
        if (r.ok) setProofs(await r.json());
      } catch { }
    })();
  }, []);

  // Get candidate count (view)
  const { data: countData } = useReadContract({
    address: VOTING_ADDR,
    abi: (votingAbi as any).abi,
    functionName: 'candidateCount',
  });

  // When count changes, fetch each candidate via individual reads
  useEffect(() => {
    const count = typeof countData === 'bigint' ? Number(countData) : 0;
    setCandidateCount(count);
    if (!count) return;

    (async () => {
      try {
        const list: Candidate[] = [];
        for (let i = 0; i < count; i++) {
          // candidates(uint256) returns struct: [name, stances[3], votes]
          const res = await (window as any).wagmi?.config?.getClient?.(); // not used; we rely on hook below
          // Instead of hook-per-item (expensive), just call readContract via fetch pattern.
          // Simpler: use viem public client from wagmi config if you exported it.
        }
       } catch { }
      })();
  }, [countData]);

  // Simple helper to get my Merkle proof (lowercased key)
  const myProof = useMemo(
    () => (address ? proofs[address.toLowerCase()] ?? null : null),
    [address, proofs]
  );

  async function vote(idx: number) {
    if (!isConnected) return alert('Connect wallet');
    if (!myProof) return alert('No Merkle proof for this address');

    await writeContractAsync({
      address: VOTING_ADDR,
      abi: (votingAbi as any).abi,
      functionName: 'vote',
      args: [BigInt(idx), myProof],
    });
    alert('Vote sent!');
  }

  async function autoVote(a: number, b: number, c: number) {
    if (!isConnected) return alert('Connect wallet');
    if (!myProof) return alert('No Merkle proof for this address');

    await writeContractAsync({
      address: VOTING_ADDR,
      abi: (votingAbi as any).abi,
      functionName: 'autoVote',
      args: [[a, b, c], myProof],
    });
    alert('Auto-vote sent!');
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Voting DApp</h1>
      <p>Connected: {isConnected ? address : 'No'}</p>
      {!isConnected ? (
        <button onClick={() => connect({ connector: connectors[0] })}>
          {connectStatus === 'pending' ? 'Connecting…' : 'Connect Wallet'}
        </button>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <span>Connected: {address}</span>
          <button onClick={() => disconnect()}>Disconnect</button>
        </div>
      )}
      <section style={{ marginTop: 16 }}>
        <h2>Candidates ({candidateCount})</h2>
        {/* For brevity, we only render indexes. Replace with real fetch of candidates (see note below). */}
        {Array.from({ length: candidateCount }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
            <span>Candidate #{i}</span>
            <button disabled={!isConnected || !myProof} onClick={() => vote(i)}>Vote</button>
          </div>
        ))}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Auto-match vote</h2>
        <button disabled={!isConnected || !myProof} onClick={() => autoVote(70, 20, 80)}>
          AutoVote with [70, 20, 80]
        </button>
      </section>
    </main>
  );
}
