export function analyzeTransactionsStructured(block, txs, topN = 3) {
  // Sortiere nach Betrag absteigend
  const txWithAmount = txs
    .filter(t => typeof t.amount === "number")
    .sort((a, b) => b.amount - a.amount);

  const topTx = txWithAmount.slice(0, topN);

  return {
    block: {
      height: block.header.height,
      hash: block.header.hash,
      timestamp: block.header.timestamp, // ns
    },
    count: txs.length,
    topTx,
    // summary wird später von LLM befüllt
    summary: null,
  };
}
