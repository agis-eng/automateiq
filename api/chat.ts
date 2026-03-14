import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CHAT_SYSTEM_PROMPT = `You are AutomateIQ, an expert AI business automation advisor. Your job is to have a friendly conversation with business owners to understand their daily workflow, then identify specific tasks that could be automated with AI tools.

Guide the conversation through these areas:
1. Business basics: type of business, industry, how long running, team size
2. Daily workflow: walk me through a typical day, what's the first thing you do each morning
3. Time drains: what tasks take the most time, what do you do repeatedly every week
4. Current tools: what software and tools do you use today (email, CRM, accounting, etc.)
5. Pain points: what frustrates you most, what do you wish you didn't have to do manually
6. Goals: revenue goals, growth plans, what would winning look like in 12 months
7. Tech comfort: how comfortable are you with new technology on a scale of 1-5

Rules:
- Ask 1-2 questions at a time
- When you notice automation opportunities, briefly acknowledge them with excitement ("Oh interesting — that's actually a perfect automation candidate!")
- Be warm, encouraging, and speak like a knowledgeable friend, not a consultant
- After covering all areas (~15-20 exchanges), tell them you have everything you need and ask if they're ready for their personalized automation report
- When user confirms ready, respond with exactly: GENERATE_REPORT followed by a JSON summary of key findings

Never break character. Be enthusiastic about helping them save time.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: "messages array is required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: CHAT_SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });

    const responseMessage = completion.choices[0]?.message?.content || "";
    const isComplete = responseMessage.includes("GENERATE_REPORT");

    return res.json({ message: responseMessage, isComplete });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return res.status(500).json({ message: error.message || "Failed to get AI response" });
  }
}
