import { fetchLatestBlock, fetchTransactionsByBlock } from "./skills/fetchNearData.js";
import { analyzeTransactions } from "./skills/analyzeData.js";
import { checkAlerts } from "./skills/alertAgent.js";
import "dotenv/config";

(async () => {
  console.log("⏳ Hole letzten Block...");
  const block = await fetchLatestBlock();
  console.log(`Block-Nummer: ${block.header.height}, Hash: ${block.header.hash}`);

  console.log("\n📦 Lade Transaktionen...");
  const txs = await fetchTransactionsByBlock(block.chunks[0].chunk_hash);
  console.log(`Gefundene Transaktionen: ${txs.length}`);

  console.log("\n🧠 Analysiere mit KI...");
  const analysis = await analyzeTransactions(txs);
  console.log("\n💡 Analyse-Ergebnis:");
  console.log(analysis);

  console.log("\n🚨 Prüfe Alerts...");
  const alerts = checkAlerts(analysis);
  if (alerts.length > 0) {
    console.log("⚡ Alerts:");
    alerts.forEach(a => console.log(`- ${a}`));
  } else {
    console.log("Keine Alerts ausgelöst.");
  }
})();
