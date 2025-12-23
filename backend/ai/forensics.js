import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeDocument(type, purpose) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are a forensic academic document expert.

Check for:
- Logical inconsistencies
- Suspicious formatting
- Invalid date or purpose

Return JSON:
{
  "score": number,
  "verdict": "AUTHENTIC" | "SUSPICIOUS",
  "signals": string[]
}
`;

  const result = await model.generateContent(prompt);
  let parsed;

  try {
    parsed = JSON.parse(result.response.text());
  } catch {
    parsed = {
      score: 70,
      verdict: "SUSPICIOUS",
      signals: ["AI uncertainty"]
    };
  }

  return parsed;
}
