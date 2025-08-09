// src/skills/generateInsights.js
import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateInsights(analysis) {
  const brief = analysis.topTx.map(t =>
    `• ${t.signer_id} → ${t.receiver_id} | ${t.amount.toFixed(2)} NEAR | ${t.hash}`
  ).join("\n");

  const prompt = `
Du bist ein Krypto-Analyst. Daten (NEAR, Testnet):
Block ${analysis.block.height} (${analysis.block.hash})
Top-Transaktionen:
${brief}

Aufgabe:
1) Fasse die wichtigsten Beobachtungen in 2–3 Sätzen auf Deutsch zusammen.
2) Markiere mögliche Gründe (z. B. Whale-Move, interne Transaktion, Bot/DEX) als Hypothesen.
  `;

  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  return resp.choices[0].message.content.trim();
}
