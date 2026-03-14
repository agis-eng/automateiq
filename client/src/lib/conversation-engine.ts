// Conversation Engine — Adaptive chat flow for business automation discovery

export interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: number;
}

export interface BusinessProfile {
  businessType: string;
  industry: string;
  yearsRunning: string;
  teamSize: string;
  dailyWorkflow: string;
  timeDrains: string[];
  currentTools: string[];
  painPoints: string[];
  goals: string;
  techComfort: number;
  rawAnswers: Record<string, string>;
}

export interface AutomationItem {
  task: string;
  tool: string;
  timeSaved: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  icon: string;
}

export interface AutomationReport {
  businessType: string;
  quickWins: AutomationItem[];
  mediumTerm: AutomationItem[];
  strategic: AutomationItem[];
  totalTimeSaved: string;
  startingPoint: { title: string; instructions: string };
}

type ConversationPhase = 
  | 'greeting'
  | 'business_type'
  | 'industry'
  | 'team_size'
  | 'daily_workflow'
  | 'time_drains'
  | 'current_tools'
  | 'pain_points'
  | 'goals'
  | 'tech_comfort'
  | 'offer_report'
  | 'complete';

const PHASE_ORDER: ConversationPhase[] = [
  'greeting',
  'business_type',
  'industry',
  'team_size',
  'daily_workflow',
  'time_drains',
  'current_tools',
  'pain_points',
  'goals',
  'tech_comfort',
  'offer_report',
];

// Pattern detection for automation opportunities
const AUTOMATION_PATTERNS: { keywords: string[]; category: string; insight: string }[] = [
  { keywords: ['email', 'inbox', 'reply', 'respond', 'messages'], category: 'email', insight: "Email management is one of the highest-ROI automations — we can likely save you 3-5 hours/week here." },
  { keywords: ['social media', 'instagram', 'facebook', 'tiktok', 'twitter', 'linkedin', 'posting', 'content'], category: 'social', insight: "Social media posting and content scheduling is perfect for automation." },
  { keywords: ['invoice', 'billing', 'payment', 'accounting', 'bookkeeping', 'quickbooks', 'freshbooks'], category: 'invoicing', insight: "Manual invoicing and billing is a huge time sink — this is a prime automation target." },
  { keywords: ['schedule', 'calendar', 'appointment', 'booking', 'meeting'], category: 'scheduling', insight: "Scheduling and appointment management can be almost fully automated." },
  { keywords: ['follow up', 'follow-up', 'followup', 'customer', 'client', 'crm', 'lead'], category: 'customer_followup', insight: "Customer follow-ups are one of the most impactful automations for revenue growth." },
  { keywords: ['content', 'blog', 'writing', 'copy', 'newsletter', 'article'], category: 'content', insight: "AI-powered content creation can cut your writing time by 60-80%." },
  { keywords: ['data entry', 'spreadsheet', 'excel', 'manual entry', 'typing'], category: 'data_entry', insight: "Data entry is the #1 task businesses should automate first." },
  { keywords: ['support', 'help desk', 'customer service', 'tickets', 'chat'], category: 'support', insight: "AI customer support can handle 70-80% of common questions automatically." },
  { keywords: ['hiring', 'recruit', 'hr', 'onboarding', 'employees', 'team'], category: 'hr', insight: "HR and hiring workflows have excellent automation potential." },
  { keywords: ['report', 'analytics', 'dashboard', 'metrics', 'tracking'], category: 'reporting', insight: "Automated reporting can save hours of manual data compilation." },
  { keywords: ['proposal', 'quote', 'estimate', 'bid'], category: 'proposals', insight: "Proposal generation is a great automation candidate — AI can draft initial versions in minutes." },
  { keywords: ['inventory', 'stock', 'supply', 'order'], category: 'inventory', insight: "Inventory management automation can prevent stockouts and reduce overhead." },
  { keywords: ['project', 'task', 'manage', 'workflow', 'process'], category: 'project_management', insight: "Project management automation can streamline your entire team's productivity." },
];

// Map detected categories to actual tool recommendations
const AUTOMATION_DATABASE: Record<string, { quickWins: AutomationItem[]; mediumTerm: AutomationItem[]; strategic: AutomationItem[] }> = {
  email: {
    quickWins: [
      { task: 'Email Filtering & Auto-Sorting', tool: 'Gmail Filters + SaneBox', timeSaved: '3 hrs/week', difficulty: 'Easy', description: 'Auto-categorize emails by priority, client, and type — never manually sort again', icon: 'mail' },
      { task: 'Email Template Responses', tool: 'Gmail Templates + TextExpander', timeSaved: '2 hrs/week', difficulty: 'Easy', description: 'Create reusable responses for common inquiries that auto-fill with one click', icon: 'mail' },
    ],
    mediumTerm: [
      { task: 'AI Email Drafting', tool: 'ChatGPT + Gmail Plugin', timeSaved: '4 hrs/week', difficulty: 'Medium', description: 'AI drafts professional responses based on your tone and past emails', icon: 'mail' },
    ],
    strategic: [
      { task: 'Full Email Workflow Automation', tool: 'Zapier + HubSpot + AI', timeSaved: '6 hrs/week', difficulty: 'Hard', description: 'Complete email-to-CRM pipeline with automated follow-ups and lead scoring', icon: 'mail' },
    ],
  },
  social: {
    quickWins: [
      { task: 'Social Media Scheduling', tool: 'Buffer or Later', timeSaved: '3 hrs/week', difficulty: 'Easy', description: 'Batch-create and schedule posts across all platforms in one sitting', icon: 'share' },
      { task: 'AI Caption Generation', tool: 'ChatGPT + Canva', timeSaved: '2 hrs/week', difficulty: 'Easy', description: 'Generate engaging captions and hashtags in seconds with AI assistance', icon: 'share' },
    ],
    mediumTerm: [
      { task: 'Content Repurposing Pipeline', tool: 'Repurpose.io + Descript', timeSaved: '5 hrs/week', difficulty: 'Medium', description: 'Turn one piece of content into 10+ formats automatically', icon: 'share' },
    ],
    strategic: [
      { task: 'AI-Powered Content Strategy', tool: 'Hootsuite + AI Analytics', timeSaved: '4 hrs/week', difficulty: 'Hard', description: 'AI analyzes performance and suggests optimal content strategy', icon: 'share' },
    ],
  },
  invoicing: {
    quickWins: [
      { task: 'Automated Invoice Generation', tool: 'QuickBooks + Stripe', timeSaved: '3 hrs/week', difficulty: 'Easy', description: 'Auto-generate and send invoices when projects complete or on recurring schedules', icon: 'receipt' },
      { task: 'Payment Reminder Automation', tool: 'FreshBooks Auto-Reminders', timeSaved: '2 hrs/week', difficulty: 'Easy', description: 'Automatic payment reminders at 7, 14, and 30 days — no awkward follow-ups', icon: 'receipt' },
    ],
    mediumTerm: [
      { task: 'Expense Categorization', tool: 'QuickBooks AI + Dext', timeSaved: '3 hrs/week', difficulty: 'Medium', description: 'AI auto-categorizes expenses from receipts and bank feeds', icon: 'receipt' },
    ],
    strategic: [
      { task: 'Full Financial Automation', tool: 'QuickBooks + Zapier + Stripe', timeSaved: '5 hrs/week', difficulty: 'Hard', description: 'End-to-end financial workflow from quote to payment to reconciliation', icon: 'receipt' },
    ],
  },
  scheduling: {
    quickWins: [
      { task: 'Online Booking System', tool: 'Calendly or Cal.com', timeSaved: '4 hrs/week', difficulty: 'Easy', description: 'Clients book directly into your calendar — no back-and-forth emails', icon: 'calendar' },
      { task: 'Meeting Prep Automation', tool: 'Calendly + Notion', timeSaved: '1 hr/week', difficulty: 'Easy', description: 'Auto-create meeting notes templates and send prep materials before calls', icon: 'calendar' },
    ],
    mediumTerm: [
      { task: 'AI Scheduling Assistant', tool: 'Reclaim.ai or Clockwise', timeSaved: '3 hrs/week', difficulty: 'Medium', description: 'AI optimizes your calendar for focus time, meetings, and breaks', icon: 'calendar' },
    ],
    strategic: [],
  },
  customer_followup: {
    quickWins: [
      { task: 'Automated Follow-Up Sequences', tool: 'Mailchimp + Zapier', timeSaved: '4 hrs/week', difficulty: 'Easy', description: 'Trigger personalized follow-up emails based on customer actions', icon: 'users' },
    ],
    mediumTerm: [
      { task: 'CRM Automation Pipeline', tool: 'HubSpot Free + Workflows', timeSaved: '5 hrs/week', difficulty: 'Medium', description: 'Auto-move leads through pipeline stages with triggered actions at each step', icon: 'users' },
      { task: 'Customer Win-Back Campaigns', tool: 'GoHighLevel or ActiveCampaign', timeSaved: '3 hrs/week', difficulty: 'Medium', description: 'Automatically re-engage inactive customers with personalized outreach', icon: 'users' },
    ],
    strategic: [
      { task: 'AI-Powered Lead Scoring', tool: 'HubSpot + AI', timeSaved: '4 hrs/week', difficulty: 'Hard', description: 'ML models predict which leads are most likely to convert, so you focus your time wisely', icon: 'users' },
    ],
  },
  content: {
    quickWins: [
      { task: 'AI Content Drafting', tool: 'ChatGPT or Claude', timeSaved: '5 hrs/week', difficulty: 'Easy', description: 'Generate first drafts of blogs, emails, and marketing copy in minutes', icon: 'pen' },
      { task: 'AI Image Generation', tool: 'Canva AI + Midjourney', timeSaved: '2 hrs/week', difficulty: 'Easy', description: 'Create professional visuals and graphics without a designer', icon: 'pen' },
    ],
    mediumTerm: [
      { task: 'Newsletter Automation', tool: 'Beehiiv + AI Writing', timeSaved: '4 hrs/week', difficulty: 'Medium', description: 'AI-assisted newsletter creation with automated scheduling and segmentation', icon: 'pen' },
    ],
    strategic: [
      { task: 'Full Content Engine', tool: 'Notion AI + Zapier + WordPress', timeSaved: '8 hrs/week', difficulty: 'Hard', description: 'Automated content pipeline from ideation to publication to distribution', icon: 'pen' },
    ],
  },
  data_entry: {
    quickWins: [
      { task: 'Form-to-Spreadsheet Automation', tool: 'Zapier + Google Sheets', timeSaved: '4 hrs/week', difficulty: 'Easy', description: 'Automatically capture form submissions, emails, and data into organized spreadsheets', icon: 'database' },
      { task: 'Document Data Extraction', tool: 'Parseur or Docparser', timeSaved: '3 hrs/week', difficulty: 'Easy', description: 'Extract data from PDFs, invoices, and documents automatically', icon: 'database' },
    ],
    mediumTerm: [
      { task: 'Cross-Platform Data Sync', tool: 'Make.com (Integromat)', timeSaved: '5 hrs/week', difficulty: 'Medium', description: 'Keep data synchronized across all your business tools automatically', icon: 'database' },
    ],
    strategic: [
      { task: 'Custom Automation Workflows', tool: 'n8n or Make.com Advanced', timeSaved: '8 hrs/week', difficulty: 'Hard', description: 'Build complex multi-step workflows that handle your entire data pipeline', icon: 'database' },
    ],
  },
  support: {
    quickWins: [
      { task: 'FAQ Chatbot', tool: 'Intercom or Tidio', timeSaved: '5 hrs/week', difficulty: 'Easy', description: 'AI chatbot answers 70-80% of common customer questions instantly', icon: 'headphones' },
    ],
    mediumTerm: [
      { task: 'AI Ticket Routing', tool: 'Zendesk AI or Freshdesk', timeSaved: '4 hrs/week', difficulty: 'Medium', description: 'Automatically categorize, prioritize, and route support tickets', icon: 'headphones' },
    ],
    strategic: [
      { task: 'AI Customer Service Agent', tool: 'Intercom Fin or Custom AI', timeSaved: '10 hrs/week', difficulty: 'Hard', description: 'AI handles complete support conversations with human-like quality', icon: 'headphones' },
    ],
  },
  hr: {
    quickWins: [
      { task: 'Application Screening', tool: 'Notion AI + Typeform', timeSaved: '3 hrs/week', difficulty: 'Easy', description: 'Auto-screen applications with AI-powered scoring and filtering', icon: 'briefcase' },
    ],
    mediumTerm: [
      { task: 'Onboarding Automation', tool: 'Notion + Zapier', timeSaved: '4 hrs/week', difficulty: 'Medium', description: 'Automated onboarding checklists, document collection, and training sequences', icon: 'briefcase' },
    ],
    strategic: [
      { task: 'AI Interview Assistant', tool: 'Custom AI + Video Platform', timeSaved: '5 hrs/week', difficulty: 'Hard', description: 'AI pre-screens candidates and generates interview summaries', icon: 'briefcase' },
    ],
  },
  reporting: {
    quickWins: [
      { task: 'Automated Dashboard', tool: 'Google Looker Studio (free)', timeSaved: '4 hrs/week', difficulty: 'Easy', description: 'Live dashboards that auto-update — no manual report generation', icon: 'chart' },
    ],
    mediumTerm: [
      { task: 'Automated Report Generation', tool: 'Zapier + Google Sheets + Docs', timeSaved: '5 hrs/week', difficulty: 'Medium', description: 'Weekly/monthly reports generated and distributed automatically', icon: 'chart' },
    ],
    strategic: [
      { task: 'AI Business Intelligence', tool: 'Custom Dashboard + AI', timeSaved: '6 hrs/week', difficulty: 'Hard', description: 'AI analyzes trends and surfaces actionable business insights proactively', icon: 'chart' },
    ],
  },
  proposals: {
    quickWins: [
      { task: 'Proposal Template System', tool: 'PandaDoc or Proposify', timeSaved: '3 hrs/week', difficulty: 'Easy', description: 'Template-based proposals that auto-fill client details and pricing', icon: 'file' },
    ],
    mediumTerm: [
      { task: 'AI Proposal Drafting', tool: 'ChatGPT + PandaDoc', timeSaved: '4 hrs/week', difficulty: 'Medium', description: 'AI generates customized proposals based on client requirements', icon: 'file' },
    ],
    strategic: [],
  },
  inventory: {
    quickWins: [
      { task: 'Low Stock Alerts', tool: 'Shopify + Zapier', timeSaved: '2 hrs/week', difficulty: 'Easy', description: 'Automatic notifications when inventory drops below set thresholds', icon: 'package' },
    ],
    mediumTerm: [
      { task: 'Automated Reordering', tool: 'TradeGecko or Cin7', timeSaved: '4 hrs/week', difficulty: 'Medium', description: 'AI-powered reorder points that automatically create purchase orders', icon: 'package' },
    ],
    strategic: [
      { task: 'Demand Forecasting', tool: 'Custom AI + ERP', timeSaved: '5 hrs/week', difficulty: 'Hard', description: 'Machine learning predicts demand and optimizes inventory levels', icon: 'package' },
    ],
  },
  project_management: {
    quickWins: [
      { task: 'Task Auto-Assignment', tool: 'Asana or Monday.com', timeSaved: '2 hrs/week', difficulty: 'Easy', description: 'Auto-assign tasks based on templates, workload, and team member skills', icon: 'clipboard' },
    ],
    mediumTerm: [
      { task: 'Project Status Automation', tool: 'Notion + Zapier + Slack', timeSaved: '3 hrs/week', difficulty: 'Medium', description: 'Automated status updates, reminders, and progress tracking across tools', icon: 'clipboard' },
    ],
    strategic: [],
  },
};

// Default fallback automations for any business
const DEFAULT_AUTOMATIONS: { quickWins: AutomationItem[]; mediumTerm: AutomationItem[]; strategic: AutomationItem[] } = {
  quickWins: [
    { task: 'AI Writing Assistant', tool: 'ChatGPT or Claude', timeSaved: '3 hrs/week', difficulty: 'Easy', description: 'Use AI to draft emails, proposals, and content 5x faster', icon: 'pen' },
    { task: 'Calendar & Scheduling', tool: 'Calendly (Free Plan)', timeSaved: '2 hrs/week', difficulty: 'Easy', description: 'Eliminate scheduling back-and-forth with automated booking links', icon: 'calendar' },
  ],
  mediumTerm: [
    { task: 'Workflow Automation Hub', tool: 'Zapier or Make.com', timeSaved: '5 hrs/week', difficulty: 'Medium', description: 'Connect your tools to automate repetitive multi-step workflows', icon: 'zap' },
  ],
  strategic: [
    { task: 'Custom AI Business Assistant', tool: 'Custom GPT + API Integrations', timeSaved: '8 hrs/week', difficulty: 'Hard', description: 'Build a personalized AI assistant trained on your business data', icon: 'bot' },
  ],
};

export class ConversationEngine {
  private phase: ConversationPhase = 'greeting';
  private profile: Partial<BusinessProfile> = { rawAnswers: {}, timeDrains: [], currentTools: [], painPoints: [] };
  private detectedCategories: Set<string> = new Set();
  private messageCount = 0;
  private exchangeCount = 0;

  getPhase(): ConversationPhase {
    return this.phase;
  }

  getProgress(): number {
    const idx = PHASE_ORDER.indexOf(this.phase);
    return Math.min(100, Math.round((idx / (PHASE_ORDER.length - 1)) * 100));
  }

  getOpportunityCount(): number {
    return this.detectedCategories.size;
  }

  getDetectedCategories(): string[] {
    return Array.from(this.detectedCategories);
  }

  isComplete(): boolean {
    return this.phase === 'complete';
  }

  getGreeting(): string {
    return `Hey there! 👋 I'm your Business Automation Advisor.\n\nI'm going to ask you a few smart questions about your business and daily workflow, then give you a personalized AI automation roadmap — with specific tools, time savings estimates, and exactly where to start.\n\nMost business owners I work with discover they can save **10-15 hours per week** with the right automations.\n\nLet's dive in — **what kind of business do you run?** (e.g., marketing agency, e-commerce store, consulting firm, restaurant, etc.)`;
  }

  private detectPatterns(text: string): string[] {
    const lower = text.toLowerCase();
    const found: string[] = [];
    for (const pattern of AUTOMATION_PATTERNS) {
      if (pattern.keywords.some(kw => lower.includes(kw))) {
        if (!this.detectedCategories.has(pattern.category)) {
          this.detectedCategories.add(pattern.category);
          found.push(pattern.insight);
        }
      }
    }
    return found;
  }

  processMessage(userMessage: string): string {
    this.messageCount++;
    this.exchangeCount++;
    const insights = this.detectPatterns(userMessage);
    const insightNote = insights.length > 0 ? `\n\n💡 *${insights[0]}*\n\n` : '';

    switch (this.phase) {
      case 'greeting':
      case 'business_type': {
        this.profile.businessType = userMessage;
        this.profile.rawAnswers!['businessType'] = userMessage;
        this.phase = 'industry';
        return `${insightNote}Great — **${userMessage}** is a space with huge automation potential!\n\nWhat industry or niche are you in, and how long have you been running this business?`;
      }

      case 'industry': {
        this.profile.industry = userMessage;
        this.profile.rawAnswers!['industry'] = userMessage;
        this.phase = 'team_size';
        return `${insightNote}Got it. Now, what does your team look like?\n\nAre you a **solo operator**, or do you have a team? If so, roughly how many people?`;
      }

      case 'team_size': {
        this.profile.teamSize = userMessage;
        this.profile.rawAnswers!['teamSize'] = userMessage;
        this.phase = 'daily_workflow';
        return `${insightNote}Perfect. Now I want to understand your day-to-day.\n\n**Walk me through a typical Monday morning** — what's the very first thing you do when you start work, and what does the next couple hours look like?`;
      }

      case 'daily_workflow': {
        this.profile.dailyWorkflow = userMessage;
        this.profile.rawAnswers!['dailyWorkflow'] = userMessage;
        this.phase = 'time_drains';
        const detected = this.detectPatterns(userMessage);
        const extra = detected.length > 0 ? `\n\n💡 *${detected[0]}*\n\n` : '';
        return `${insightNote}${extra}Interesting workflow. I'm already spotting some patterns here.\n\n**What tasks eat up the most time in your week?** What do you find yourself doing over and over that feels repetitive or tedious?`;
      }

      case 'time_drains': {
        this.profile.timeDrains = userMessage.split(/[,;.]/).map(s => s.trim()).filter(Boolean);
        this.profile.rawAnswers!['timeDrains'] = userMessage;
        this.phase = 'current_tools';
        return `${insightNote}Those are exactly the types of tasks that AI and automation handle really well.\n\n**What software and tools do you currently use** to run your business? (Think email, CRM, accounting, project management, social media tools, etc.)`;
      }

      case 'current_tools': {
        this.profile.currentTools = userMessage.split(/[,;.]/).map(s => s.trim()).filter(Boolean);
        this.profile.rawAnswers!['currentTools'] = userMessage;
        this.phase = 'pain_points';
        return `${insightNote}Good — knowing your current tools helps me recommend automations that integrate with what you already have.\n\n**What frustrates you most about running your business day-to-day?** What do you wish you never had to do again?`;
      }

      case 'pain_points': {
        this.profile.painPoints = userMessage.split(/[,;.]/).map(s => s.trim()).filter(Boolean);
        this.profile.rawAnswers!['painPoints'] = userMessage;
        this.phase = 'goals';
        return `${insightNote}I hear you — those frustrations are really common, and the good news is most of them have proven automation solutions.\n\n**What are your goals for the next 12 months?** Think revenue targets, growth plans, or what "winning" would look like for your business.`;
      }

      case 'goals': {
        this.profile.goals = userMessage;
        this.profile.rawAnswers!['goals'] = userMessage;
        this.phase = 'tech_comfort';
        return `${insightNote}Love the ambition! The right automations can absolutely help you get there faster.\n\nLast question — **on a scale of 1 to 5, how comfortable are you with learning new technology?**\n\n1 = "I struggle with basic software"\n3 = "I can figure out most tools with some effort"\n5 = "I love tech and pick up new tools quickly"`;
      }

      case 'tech_comfort': {
        const num = parseInt(userMessage.replace(/[^0-9]/g, '')) || 3;
        this.profile.techComfort = Math.min(5, Math.max(1, num));
        this.profile.rawAnswers!['techComfort'] = userMessage;
        this.phase = 'offer_report';

        const oppCount = this.detectedCategories.size;
        const opText = oppCount > 0 
          ? `I've identified **${oppCount} specific automation opportunities** for your business so far` 
          : `Based on everything you've told me, I've identified **several key automation opportunities**`;

        return `${insightNote}Thanks! That helps me calibrate the right recommendations for your comfort level.\n\n${opText}. I'm ready to generate your **personalized AI Automation Roadmap** — this will include:\n\n✅ Quick wins you can implement this week\n📈 Medium-term automations for the next 1-3 months\n🚀 Strategic automations for long-term transformation\n💰 Estimated time savings for each recommendation\n\n**Ready to see your report?** Just say "yes" or "generate my report"!`;
      }

      case 'offer_report': {
        this.phase = 'complete';
        return '__GENERATE_REPORT__';
      }

      default:
        return "I think we've covered everything! Let me generate your report.";
    }
  }

  generateReport(): AutomationReport {
    const categories = Array.from(this.detectedCategories);
    
    // If we detected very few categories, add some defaults based on business type
    if (categories.length < 3) {
      const bType = (this.profile.businessType || '').toLowerCase();
      if (!this.detectedCategories.has('email')) categories.push('email');
      if (!this.detectedCategories.has('scheduling')) categories.push('scheduling');
      if (bType.includes('agency') || bType.includes('consult')) {
        if (!this.detectedCategories.has('proposals')) categories.push('proposals');
        if (!this.detectedCategories.has('content')) categories.push('content');
      }
      if (bType.includes('commerce') || bType.includes('shop') || bType.includes('retail') || bType.includes('store')) {
        if (!this.detectedCategories.has('inventory')) categories.push('inventory');
        if (!this.detectedCategories.has('customer_followup')) categories.push('customer_followup');
      }
      if (bType.includes('restaurant') || bType.includes('food') || bType.includes('service')) {
        if (!this.detectedCategories.has('scheduling')) categories.push('scheduling');
        if (!this.detectedCategories.has('customer_followup')) categories.push('customer_followup');
      }
    }

    const techComfort = this.profile.techComfort || 3;
    
    // Collect all recommendations
    let allQuickWins: AutomationItem[] = [];
    let allMediumTerm: AutomationItem[] = [];
    let allStrategic: AutomationItem[] = [];

    for (const cat of categories) {
      const db = AUTOMATION_DATABASE[cat];
      if (db) {
        allQuickWins.push(...db.quickWins);
        allMediumTerm.push(...db.mediumTerm);
        allStrategic.push(...db.strategic);
      }
    }

    // Add defaults if needed
    if (allQuickWins.length < 3) allQuickWins.push(...DEFAULT_AUTOMATIONS.quickWins);
    if (allMediumTerm.length < 2) allMediumTerm.push(...DEFAULT_AUTOMATIONS.mediumTerm);
    if (allStrategic.length < 1) allStrategic.push(...DEFAULT_AUTOMATIONS.strategic);

    // Deduplicate by task name
    const dedup = (items: AutomationItem[]) => {
      const seen = new Set<string>();
      return items.filter(item => {
        if (seen.has(item.task)) return false;
        seen.add(item.task);
        return true;
      });
    };

    allQuickWins = dedup(allQuickWins).slice(0, 5);
    allMediumTerm = dedup(allMediumTerm).slice(0, 4);
    allStrategic = dedup(allStrategic).slice(0, 3);

    // For low tech comfort, filter out hard items from quick wins
    if (techComfort <= 2) {
      allQuickWins = allQuickWins.filter(i => i.difficulty === 'Easy');
      if (allQuickWins.length < 3) allQuickWins.push(...DEFAULT_AUTOMATIONS.quickWins);
      allQuickWins = dedup(allQuickWins).slice(0, 5);
    }

    // Calculate total time saved
    const parseHours = (s: string) => parseInt(s) || 0;
    const total = [...allQuickWins, ...allMediumTerm, ...allStrategic].reduce((sum, item) => sum + parseHours(item.timeSaved), 0);

    // Pick best starting point
    const startItem = allQuickWins[0] || DEFAULT_AUTOMATIONS.quickWins[0];
    const startingPoint = {
      title: startItem.task,
      instructions: `Start with **${startItem.tool}** — it's the easiest win with the highest impact. Here's how:\n\n1. Sign up for a free account at ${startItem.tool.split(' ')[0].toLowerCase()}.com\n2. Connect it to your existing ${this.profile.currentTools?.[0] || 'email'}\n3. Set up your first automation using their template library\n4. Test with a small workflow before going full scale\n\nThis alone should save you **${startItem.timeSaved}** — and you can set it up in under 30 minutes.`,
    };

    return {
      businessType: this.profile.businessType || 'Your Business',
      quickWins: allQuickWins,
      mediumTerm: allMediumTerm,
      strategic: allStrategic,
      totalTimeSaved: `${total}+ hours/week`,
      startingPoint,
    };
  }
}
