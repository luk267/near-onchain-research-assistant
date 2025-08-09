import fetch from "node-fetch";

const RPC_URL = process.env.NEAR_RPC_URL || "https://rpc.testnet.near.org";

const rpc = (method, params) =>
  fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: method, method, params }),
  }).then(r => r.json());

export async function fetchLatestBlock() {
  const { result } = await rpc("block", { finality: "final" });
  return result; // enthält header + chunks[]
}

export async function fetchChunk(chunkHash) {
  const { result } = await rpc("chunk", [chunkHash]);
  return result; // enthält transactions[], receipts[] etc.
}

export function yoctoToNear(yocto) {
  if (!yocto) return 0;
  // vermeidet BigInt-Probleme für große Werte
  const s = yocto.toString();
  const len = s.length;
  if (len <= 24) return Number(s) / 1e24;
  const head = Number(s.slice(0, len - 24));
  const tail = Number(s.slice(len - 24)) / 1e24;
  return head + tail;
}

/**
 * Extrahiert "Transfer"-Beträge aus Actions einer Tx
 */
export function extractTransferAmountNEAR(tx) {
  // NEAR RPC: tx.actions ist ein Array von Varianten, z.B. { Transfer: { deposit: "..." } }
  if (!tx?.actions?.length) return 0;
  let sum = 0;
  for (const act of tx.actions) {
    if (act?.Transfer?.deposit) {
      sum += yoctoToNear(act.Transfer.deposit);
    }
  }
  return sum;
}

/**
 * Lädt alle Transaktionen eines Blocks über seine chunk_hashes
 */
export async function fetchBlockTransactionsWithAmounts(block) {
  const txs = [];
  for (const ch of block.chunks || []) {
    const chunk = await fetchChunk(ch.chunk_hash);
    for (const tx of chunk.transactions || []) {
      const amount = extractTransferAmountNEAR(tx);
      txs.push({
        hash: tx.hash,
        signer_id: tx.signer_id,
        receiver_id: tx.receiver_id,
        actions: tx.actions,
        amount, // in NEAR
      });
    }
  }
  return txs;
}
