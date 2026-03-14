import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
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
  });

  // Report generation endpoint
  app.post("/api/generate-report", async (req, res) => {
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
  });

  return httpServer;
}
