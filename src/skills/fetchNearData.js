import fetch from "node-fetch";

const RPC_URL = "https://rpc.testnet.near.org";

/**
 * Holt den neuesten Block
 */
export async function fetchLatestBlock() {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "latest-block",
      method: "block",
      params: { finality: "final" }
    })
  });
  const data = await res.json();
  return data.result;
}

/**
 * Holt alle Transaktionen eines Blocks anhand der Block-Hash
 */
export async function fetchTransactionsByBlock(blockHash) {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "tx-list",
      method: "chunk",
      params: [blockHash, 0] // 0 = erster Chunk
    })
  });
  const data = await res.json();
  return data.result.transactions || [];
}
