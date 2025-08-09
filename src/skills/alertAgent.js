// src/skills/alertAgent.js
export function checkAlerts(analysis, rules = { largeTxNear: 1000 }) {
  const alerts = [];
  for (const tx of analysis.topTx || []) {
    if (tx.amount > rules.largeTxNear) {
      alerts.push(`Whale? ${tx.amount.toFixed(2)} NEAR: ${tx.signer_id} → ${tx.receiver_id} (${tx.hash})`);
    }
  }
  return alerts;
}
