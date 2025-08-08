import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateInsights(analysis) {
  const prompt = `
    Analysiere folgende NEAR-Transaktionsdaten:
    ${JSON.stringify(analysis.topTx, null, 2)}

    Fasse die wichtigsten Erkenntnisse in 2-3 Sätzen zusammen.
    Gehe auf mögliche Gründe oder Marktbewegungen ein.
  `;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  return response.choices[0].message.content;
}
