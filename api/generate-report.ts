import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const REPORT_SYSTEM_PROMPT = `Based on this conversation with a business owner, generate a detailed, personalized AI Automation Roadmap. Structure it exactly like this:

QUICK WINS (can start this week):
For each item include: Task Name, Recommended Tool, Time Saved Per Week, Difficulty (Easy/Medium/Hard), One-line description

MEDIUM-TERM OPPORTUNITIES (1-3 months):
Same format, 3-4 items

STRATEGIC AUTOMATIONS (3-12 months):
Same format, 2-3 items

TOTAL TIME SAVINGS: X hours per week

RECOMMENDED FIRST STEP: Single most impactful action with exact instructions on how to get started today.

Be specific to their actual business. Use real tool names (Zapier, Make.com, GoHighLevel, HubSpot, QuickBooks, Calendly, Buffer, ChatGPT, Claude, etc.). Make time savings estimates realistic.`;

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
        { role: "system", content: REPORT_SYSTEM_PROMPT },
        ...messages,
        {
          role: "user",
          content:
            "Based on our entire conversation above, please generate my detailed, personalized AI Automation Roadmap now.",
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const report = completion.choices[0]?.message?.content || "";

    return res.json({ report });
  } catch (error: any) {
    console.error("Report API error:", error);
    return res.status(500).json({ message: error.message || "Failed to generate report" });
  }
}
