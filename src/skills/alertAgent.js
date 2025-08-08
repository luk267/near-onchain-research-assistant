/**
 * Checkt Alerts basierend auf der Analyse.
 * Beispielregel: Warnung, wenn große Transaktionen (> 1000 NEAR) erkannt wurden.
 */
export function checkAlerts(analysis) {
  const alerts = [];

  if (analysis.topTx) {
    for (const tx of analysis.topTx) {
      if (tx.amount && Number(tx.amount) > 1000) {
        alerts.push(`Große Transaktion entdeckt: ${tx.signer_id} → ${tx.receiver_id} über ${tx.amount} NEAR`);
      }
    }
  }

  // Weitere Alert-Regeln können hier ergänzt werden

  return alerts;
}
