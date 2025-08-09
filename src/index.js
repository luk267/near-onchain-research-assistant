// src/index.js
import "dotenv/config";
import { fetchLatestBlock, fetchBlockTransactionsWithAmounts } from "./skills/fetchNearData.js";
import { analyzeTransactionsStructured } from "./skills/analyzeData.js";
import { generateInsights } from "./skills/generateInsights.js";
import { checkAlerts } from "./skills/alertAgent.js";
import fetch from "node-fetch";

const POLL_MS = Number(process.env.POLL_MS || 8000);
const seenBlocks = new Set();
const seenTx = new Set();

async function sendDiscord(message) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: message }),
  });
}

async function processOnce() {
  const block = await fetchLatestBlock();
  if (seenBlocks.has(block.header.hash)) return;
  seenBlocks.add(block.header.hash);

  const txs = await fetchBlockTransactionsWithAmounts(block);

  // Dedup pro Lauf (falls Polling mehrere Blöcke überspringt)
  const newTxs = txs.filter(t => !seenTx.has(t.hash));
  newTxs.forEach(t => seenTx.add(t.hash));

  const analysis = analyzeTransactionsStructured(block, newTxs);
  analysis.summary = await generateInsights(analysis);

  console.log(`\n🧱 Block #${analysis.block.height} | ${newTxs.length} neue Tx`);
  console.log("TopTx:", analysis.topTx.map(t => `${t.amount.toFixed(2)} NEAR ${t.signer_id}→${t.receiver_id}`).join(" | "));
  console.log("\n💡 Insights:\n" + analysis.summary);

  const alerts = checkAlerts(analysis, { largeTxNear: Number(process.env.ALERT_LARGE_NEAR || 1000) });
  if (alerts.length) {
    console.log("\n🚨 Alerts:");
    for (const a of alerts) {
      console.log(" - " + a);
      await sendDiscord(`🚨 ${a}\nBlock #${analysis.block.height}`);
    }
  } else {
    console.log("\n✅ Keine Alerts ausgelöst.");
  }
}

async function main() {
  console.log("NEAR On-Chain Research Assistant – Live");
  await processOnce();
  const timer = setInterval(processOnce, POLL_MS);

  const shutdown = () => { clearInterval(timer); process.exit(0); };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
main().catch(e => { console.error(e); process.exit(1); });
