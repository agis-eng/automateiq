import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Sparkles, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { AutomateIQLogo } from "./landing";

interface Section {
  id: string;
  title: string;
  subtitle: string;
  questions: { id: string; label: string; placeholder: string; type: 'text' | 'textarea' }[];
}

const SECTIONS: Section[] = [
  {
    id: "business-snapshot",
    title: "Business Snapshot",
    subtitle: "Let's start with the big picture of your business",
    questions: [
      { id: "business_desc", label: "What does your business do in one or two sentences?", placeholder: "e.g., We run a digital marketing agency helping small businesses grow online...", type: "textarea" },
      { id: "customers", label: "Who are your main types of customers, and what problems do they come to you to solve?", placeholder: "e.g., Small business owners who need help with online presence, lead generation...", type: "textarea" },
      { id: "top_goals", label: "What are your top 3 business goals for the next 12 months?", placeholder: "e.g., 1) Increase revenue by 30% 2) Hire 2 more team members 3) Launch a new service line", type: "textarea" },
    ],
  },
  {
    id: "ai-goals",
    title: "AI Goals & Constraints",
    subtitle: "What you want from AI — and any boundaries",
    questions: [
      { id: "ai_goals", label: "What would you like AI to help you achieve?", placeholder: "e.g., Save time on repetitive tasks, reduce errors in data entry, improve customer response time...", type: "textarea" },
      { id: "ideal_future", label: "If AI worked perfectly, what would be different in your day-to-day work 6 months from now?", placeholder: "e.g., I'd spend less time on admin and more time on strategy and client relationships...", type: "textarea" },
      { id: "constraints", label: "Any constraints or non-negotiables? (budget, tools that can't change, compliance rules, etc.)", placeholder: "e.g., Must keep using QuickBooks, budget under $500/month, no AI chatbots talking to customers directly...", type: "textarea" },
    ],
  },
  {
    id: "daily-routines",
    title: "Daily & Weekly Routines",
    subtitle: "Help us understand how your time is spent",
    questions: [
      { id: "typical_day", label: "Walk me through a typical workday — what are the main blocks of work?", placeholder: "e.g., Morning: check emails, review orders. Midday: client calls, project work. Afternoon: admin, invoicing...", type: "textarea" },
      { id: "repetitive_tasks", label: "Which tasks feel repetitive or 'I've done this a thousand times'?", placeholder: "e.g., Sending follow-up emails, creating invoices, updating spreadsheets, posting to social media...", type: "textarea" },
      { id: "postponed_tasks", label: "Which tasks do you often postpone because they're boring, manual, or time-consuming?", placeholder: "e.g., Reconciling accounts, writing blog posts, cleaning up CRM data...", type: "textarea" },
    ],
  },
  {
    id: "lead-gen",
    title: "Lead Generation & Sales",
    subtitle: "How you find and convert customers",
    questions: [
      { id: "lead_sources", label: "How do new leads or customers first find or contact you?", placeholder: "e.g., Website form, Google search, referrals, social media DMs, marketplace listings...", type: "textarea" },
      { id: "lead_to_customer", label: "What happens step by step from new lead to paying customer?", placeholder: "e.g., 1) Lead fills out form 2) I email them back 3) Schedule a call 4) Send proposal 5) Follow up...", type: "textarea" },
      { id: "sales_bottlenecks", label: "Where do delays or drop-offs usually happen in your sales process?", placeholder: "e.g., Slow follow-up, takes too long to create quotes, scheduling back-and-forth...", type: "textarea" },
    ],
  },
  {
    id: "customer-service",
    title: "Customer Service & Communication",
    subtitle: "How you interact with customers",
    questions: [
      { id: "common_questions", label: "What are the most common questions customers ask before or after buying?", placeholder: "e.g., Pricing, turnaround time, what's included, how to get started, shipping status...", type: "textarea" },
      { id: "support_channels", label: "Through which channels do these questions arrive?", placeholder: "e.g., Email, live chat, phone, Instagram DMs, SMS, Facebook Messenger...", type: "textarea" },
      { id: "templated_replies", label: "Which parts of your replies are mostly the same every time, and which need true customization?", placeholder: "e.g., Pricing info is always the same, but project scope details change per client...", type: "textarea" },
    ],
  },
  {
    id: "operations",
    title: "Operations & Workflow",
    subtitle: "How your key processes actually work",
    questions: [
      { id: "key_process", label: "Pick one key process (onboarding a client, fulfilling an order, etc.) and walk through it step by step.", placeholder: "e.g., 1) Client signs contract 2) I create their folder in Drive 3) Set up project in Asana 4) Send welcome email...", type: "textarea" },
      { id: "error_points", label: "Where do errors or miscommunications usually happen, and what are the consequences?", placeholder: "e.g., Wrong specs get passed to the team, deliverables get delayed, customer gets frustrated...", type: "textarea" },
      { id: "judgment_vs_routine", label: "Which steps require judgment or expertise, and which are mostly routine or rule-based?", placeholder: "e.g., Strategy decisions need my input, but data entry, file creation, and status updates are routine...", type: "textarea" },
    ],
  },
  {
    id: "systems",
    title: "Documents, Data & Systems",
    subtitle: "Your tech stack and data flow",
    questions: [
      { id: "current_tools", label: "What software tools and systems do you use today?", placeholder: "e.g., Gmail, HubSpot, QuickBooks, Slack, Google Sheets, Shopify, Asana...", type: "textarea" },
      { id: "key_data", label: "What key data do you rely on and where does it live?", placeholder: "e.g., Customer list in HubSpot, invoices in QuickBooks, project history in Notion, inventory in Shopify...", type: "textarea" },
      { id: "data_reentry", label: "Where are you copying or re-entering the same data between systems?", placeholder: "e.g., Customer info from email to CRM, order details from Shopify to spreadsheet, CRM to invoicing...", type: "textarea" },
    ],
  },
  {
    id: "marketing",
    title: "Marketing & Content",
    subtitle: "How you promote your business",
    questions: [
      { id: "marketing_channels", label: "How do you currently market your business?", placeholder: "e.g., Email newsletters, Instagram, Google Ads, SEO, referral program, events...", type: "textarea" },
      { id: "marketing_tasks", label: "What recurring marketing tasks do you handle?", placeholder: "e.g., Weekly newsletter, daily social posts, monthly ad optimization, blog writing...", type: "textarea" },
      { id: "marketing_avoided", label: "Which marketing tasks do you avoid or never get to, even though you know they're important?", placeholder: "e.g., SEO optimization, video content, A/B testing emails, analyzing ad performance...", type: "textarea" },
    ],
  },
  {
    id: "metrics",
    title: "Metrics & Reporting",
    subtitle: "The numbers that drive your decisions",
    questions: [
      { id: "key_metrics", label: "What numbers do you look at regularly to run your business?", placeholder: "e.g., Revenue, profit margin, lead count, close rate, customer churn, ticket volume...", type: "textarea" },
      { id: "reporting_method", label: "How do you currently generate those reports?", placeholder: "e.g., Manually in Google Sheets, built-in tool dashboards, downloading CSVs and combining them...", type: "textarea" },
      { id: "missing_insights", label: "Are there insights you wish you had but don't, because reporting takes too long?", placeholder: "e.g., Customer lifetime value, which marketing channel converts best, team productivity trends...", type: "textarea" },
    ],
  },
  {
    id: "pain-points",
    title: "Pain Points & Priorities",
    subtitle: "Where automation would have the biggest impact",
    questions: [
      { id: "eliminate_tasks", label: "If you could eliminate three tasks from your week forever, what would they be?", placeholder: "e.g., 1) Manual data entry 2) Writing follow-up emails 3) Creating monthly reports", type: "textarea" },
      { id: "biggest_waste", label: "Where do you feel the most waste — time, money, rework, or lost opportunities?", placeholder: "e.g., Spending 2 hours/day on emails that could be templated, losing leads due to slow follow-up...", type: "textarea" },
      { id: "one_automation", label: "If we could only automate one process in the next 30 days, which would have the biggest impact and why?", placeholder: "e.g., Lead follow-up — we're losing potential customers because we don't respond fast enough...", type: "textarea" },
    ],
  },
  {
    id: "team",
    title: "Team & Roles",
    subtitle: "Who's involved in your operations",
    questions: [
      { id: "team_members", label: "Who is on your team, and what are their main responsibilities?", placeholder: "e.g., Solo operator / 2 VAs handling customer service / 1 developer, 1 designer, 1 project manager...", type: "textarea" },
      { id: "admin_heavy", label: "Which team members spend the most time on repetitive admin or coordination tasks?", placeholder: "e.g., My VA spends 3 hours/day on data entry, I spend an hour each morning sorting emails...", type: "textarea" },
      { id: "owner_only_tasks", label: "Are there tasks that only you know how to do that you'd like to delegate or systemize?", placeholder: "e.g., Client onboarding process, pricing calculations, quality reviews...", type: "textarea" },
    ],
  },
  {
    id: "compliance",
    title: "Risk & Compliance",
    subtitle: "Boundaries for AI in your business",
    questions: [
      { id: "regulations", label: "Any regulations or compliance requirements you must follow?", placeholder: "e.g., HIPAA, GDPR, financial regulations, industry licensing, none that I know of...", type: "text" },
      { id: "ai_boundaries", label: "Are there tasks you do NOT want AI to touch?", placeholder: "e.g., Pricing decisions, sensitive customer conversations, financial approvals, hiring decisions...", type: "textarea" },
      { id: "ai_comfort", label: "How comfortable are you with AI interacting directly with customers vs. being behind the scenes?", placeholder: "e.g., Fine with chatbots for FAQs, but want a human for anything complex / Prefer AI stays behind the scenes only...", type: "textarea" },
    ],
  },
  {
    id: "readiness",
    title: "Implementation Readiness",
    subtitle: "Where you are on your AI journey",
    questions: [
      { id: "ai_experience", label: "Have you used any AI tools so far? What worked well or poorly?", placeholder: "e.g., Used ChatGPT for writing — works great. Tried a chatbot for support — customers hated it...", type: "textarea" },
      { id: "maintenance", label: "Do you have someone who could own and maintain automations, or would you need outside help?", placeholder: "e.g., I can handle basic setup myself / Would need a contractor / My VA could manage it with training...", type: "textarea" },
      { id: "budget", label: "What budget range feels realistic for AI and automation right now?", placeholder: "e.g., $0-100/mo for tools, $100-500/mo, $500+/mo, open to one-time investments...", type: "text" },
    ],
  },
];

export default function QuestionnairePage() {
  const [, navigate] = useLocation();
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const formRef = useRef<HTMLDivElement>(null);

  const section = SECTIONS[currentSection];
  const progress = Math.round(((currentSection) / SECTIONS.length) * 100);
  const isLastSection = currentSection === SECTIONS.length - 1;

  // Scroll to top on section change
  useEffect(() => {
    formRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentSection]);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const sectionHasAnswers = () => {
    return section.questions.some(q => (answers[q.id] || "").trim().length > 0);
  };

  const goNext = () => {
    if (isLastSection) {
      generateReport();
    } else {
      setDirection(1);
      setCurrentSection(prev => prev + 1);
    }
  };

  const goBack = () => {
    if (currentSection > 0) {
      setDirection(-1);
      setCurrentSection(prev => prev - 1);
    }
  };

  const skipSection = () => {
    if (!isLastSection) {
      setDirection(1);
      setCurrentSection(prev => prev + 1);
    }
  };

  const generateReport = useCallback(async () => {
    setIsGenerating(true);

    // Build a conversation-like message history from the form answers
    const messages: { role: string; content: string }[] = [];

    for (const sec of SECTIONS) {
      const sectionAnswers = sec.questions
        .map(q => {
          const answer = (answers[q.id] || "").trim();
          if (!answer) return null;
          return `${q.label}\n${answer}`;
        })
        .filter(Boolean);

      if (sectionAnswers.length > 0) {
        // Bot asks the section questions
        messages.push({
          role: "assistant",
          content: `Let's talk about ${sec.title.toLowerCase()}. ${sec.questions.map(q => q.label).join(" ")}`,
        });
        // User responds with their answers
        messages.push({
          role: "user",
          content: sectionAnswers.join("\n\n"),
        });
      }
    }

    try {
      const res = await apiRequest("POST", "/api/generate-report", { messages });
      const data = await res.json();
      (window as any).__automateiq_report = data.report;
      navigate("/report");
    } catch (error) {
      console.error("Report generation failed:", error);
      setIsGenerating(false);
    }
  }, [answers, navigate]);

  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 px-6 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Generating Your Automation Roadmap</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Analyzing your responses and building personalized recommendations...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border/60 bg-background/80 backdrop-blur-md z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="p-1.5 h-auto"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <AutomateIQLogo className="h-6 w-6 text-primary" />
              <div>
                <div className="text-sm font-semibold text-foreground leading-tight">AutomateIQ</div>
                <div className="text-[11px] text-muted-foreground leading-tight">Questionnaire Mode</div>
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground font-medium">
            {currentSection + 1} of {SECTIONS.length}
          </div>
        </div>
        <div className="px-4 pb-2 max-w-2xl mx-auto">
          <Progress value={progress} className="h-1.5" />
        </div>
      </header>

      {/* Content */}
      <div ref={formRef} className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={section.id}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.25 }}
            >
              {/* Section header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-accent tracking-wider">
                    {String(currentSection + 1).padStart(2, "0")}
                  </span>
                  <div className="h-px flex-1 bg-border/40" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">{section.title}</h2>
                <p className="text-sm text-muted-foreground">{section.subtitle}</p>
              </div>

              {/* Questions */}
              <div className="space-y-6">
                {section.questions.map((q, i) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {q.label}
                    </label>
                    {q.type === "textarea" ? (
                      <textarea
                        value={answers[q.id] || ""}
                        onChange={(e) => handleAnswer(q.id, e.target.value)}
                        placeholder={q.placeholder}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-border/60 bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all resize-none"
                      />
                    ) : (
                      <input
                        type="text"
                        value={answers[q.id] || ""}
                        onChange={(e) => handleAnswer(q.id, e.target.value)}
                        placeholder={q.placeholder}
                        className="w-full px-4 py-3 rounded-xl border border-border/60 bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer navigation */}
      <div className="flex-shrink-0 border-t border-border/60 bg-background/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            disabled={currentSection === 0}
            className="gap-1.5 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            {!isLastSection && (
              <Button
                variant="ghost"
                size="sm"
                onClick={skipSection}
                className="gap-1.5 text-muted-foreground text-xs"
              >
                Skip
                <SkipForward className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              onClick={goNext}
              size="sm"
              disabled={!sectionHasAnswers() && !isLastSection}
              className={`gap-1.5 ${
                isLastSection
                  ? "bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
              }`}
            >
              {isLastSection ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate My Report
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Section indicator dots */}
      <div className="flex-shrink-0 bg-background border-t border-border/30 py-2">
        <div className="max-w-2xl mx-auto px-4 flex justify-center gap-1.5">
          {SECTIONS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentSection ? 1 : -1);
                setCurrentSection(i);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                i === currentSection
                  ? "bg-primary w-6"
                  : i < currentSection
                  ? "bg-primary/40"
                  : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
