import OpenAI from "openai";

// API-Key aus Umgebungsvariable laden
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Analysiert Transaktionsdaten und gibt eine kurze Zusammenfassung
 */
export async function analyzeTransactions(transactions) {
  if (!transactions.length) {
    return "Keine Transaktionen gefunden.";
  }

  const txSummary = transactions.map(tx => `Von ${tx.signer_id} an ${tx.receiver_id}`).join("\n");

  const prompt = `
    Du bist ein Blockchain-Analyst.
    Hier sind die neuesten Transaktionen vom NEAR Testnet:
    ${txSummary}
    Fasse diese Daten in 3 kurzen Sätzen auf Deutsch zusammen.
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2
  });

  return response.choices[0].message.content;
}
