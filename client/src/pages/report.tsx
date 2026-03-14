import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Clock, Zap, ArrowRight, Download, Copy, Share2,
  CheckCircle2, TrendingUp, Rocket, Mail, Share,
  Receipt, Calendar, Users, PenTool, Database,
  Headphones, Briefcase, BarChart3, FileText, Package,
  ClipboardList, Bot, ArrowLeft, ChevronRight, Check,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import type { AutomationReport, AutomationItem } from "@/lib/conversation-engine";
import { AutomateIQLogo } from "./landing";
import confetti from "canvas-confetti";

const ICON_MAP: Record<string, any> = {
  mail: Mail,
  share: Share,
  receipt: Receipt,
  calendar: Calendar,
  users: Users,
  pen: PenTool,
  database: Database,
  headphones: Headphones,
  briefcase: Briefcase,
  chart: BarChart3,
  file: FileText,
  package: Package,
  clipboard: ClipboardList,
  zap: Zap,
  bot: Bot,
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function AutomationCard({ item, index, delay }: { item: AutomationItem; index: number; delay: number }) {
  const IconComponent = ICON_MAP[item.icon] || Zap;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="group p-4 rounded-xl border border-border/60 bg-card hover:border-primary/20 hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/15 transition-colors">
          <IconComponent className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-sm font-semibold text-foreground">{item.task}</h4>
            <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 flex-shrink-0 ${DIFFICULTY_COLORS[item.difficulty]}`}>
              {item.difficulty}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-2">{item.description}</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="font-medium text-primary flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {item.tool}
            </span>
            <span className="font-semibold text-accent flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {item.timeSaved}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ReportSection({
  title,
  subtitle,
  icon: Icon,
  items,
  baseDelay,
  accentClass,
}: {
  title: string;
  subtitle: string;
  icon: any;
  items: AutomationItem[];
  baseDelay: number;
  accentClass: string;
}) {
  if (items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: baseDelay }}
      className="mb-10"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accentClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <AutomationCard key={i} item={item} index={i} delay={baseDelay + 0.1 + i * 0.08} />
        ))}
      </div>
    </motion.div>
  );
}

export default function ReportPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [report, setReport] = useState<AutomationReport | null>(null);
  const [copied, setCopied] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data = (window as any).__automateiq_report as AutomationReport | undefined;
    if (!data) {
      navigate("/");
      return;
    }
    setReport(data);

    // Celebration confetti
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#064E3B', '#D97706', '#10B981', '#F59E0B'],
      });
    }, 500);

    // Second burst
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#064E3B', '#D97706'],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#10B981', '#F59E0B'],
      });
    }, 900);
  }, [navigate]);

  if (!report) return null;

  // Generate text version for download/copy
  const generateTextReport = () => {
    const lines: string[] = [];
    lines.push(`YOUR AI AUTOMATION ROADMAP — ${report.businessType.toUpperCase()}`);
    lines.push('='.repeat(60));
    lines.push('Generated by AutomateIQ');
    lines.push('');

    const addSection = (title: string, items: AutomationItem[]) => {
      if (items.length === 0) return;
      lines.push(`\n${title}`);
      lines.push('-'.repeat(40));
      items.forEach((item, i) => {
        lines.push(`${i + 1}. ${item.task}`);
        lines.push(`   Tool: ${item.tool}`);
        lines.push(`   Time Saved: ${item.timeSaved}`);
        lines.push(`   Difficulty: ${item.difficulty}`);
        lines.push(`   ${item.description}`);
        lines.push('');
      });
    };

    addSection('QUICK WINS (Start This Week)', report.quickWins);
    addSection('MEDIUM-TERM OPPORTUNITIES (1-3 Months)', report.mediumTerm);
    addSection('STRATEGIC AUTOMATIONS (3-12 Months)', report.strategic);

    lines.push(`\nTOTAL ESTIMATED TIME SAVINGS: ${report.totalTimeSaved}`);
    lines.push(`\nRECOMMENDED STARTING POINT: ${report.startingPoint.title}`);
    lines.push(report.startingPoint.instructions.replace(/\*\*/g, ''));

    return lines.join('\n');
  };

  const handleDownload = () => {
    const text = generateTextReport();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AutomateIQ-Report-${report.businessType.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Report downloaded!", description: "Check your downloads folder." });
  };

  const handleCopy = async () => {
    const text = generateTextReport();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: "Copied to clipboard!", description: "You can paste it anywhere." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Please try the download button instead.", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    const text = generateTextReport();
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My AI Automation Roadmap', text });
      } catch { /* user cancelled */ }
    } else {
      handleCopy();
    }
  };

  // Calculate total items
  const totalItems = report.quickWins.length + report.mediumTerm.length + report.strategic.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              data-testid="button-back-to-home"
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="p-1.5 h-auto"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <AutomateIQLogo className="h-6 w-6 text-primary" />
              <span className="text-sm font-semibold text-foreground">Your Automation Roadmap</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              data-testid="button-copy"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="text-xs gap-1.5"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              data-testid="button-download"
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="text-xs gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
            <Button
              data-testid="button-share"
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="text-xs gap-1.5 hidden sm:flex"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </Button>
          </div>
        </div>
      </header>

      <div ref={reportRef} className="max-w-3xl mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mb-4">
            <Sparkles className="h-3 w-3" />
            Your Personalized Report
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">
            AI Automation Roadmap
          </h1>
          <p className="text-muted-foreground text-sm">
            for <span className="text-foreground font-medium">{report.businessType}</span>
          </p>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10"
        >
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
            <Clock className="h-5 w-5 text-primary mx-auto mb-1.5" />
            <div className="text-lg font-extrabold text-primary">{report.totalTimeSaved}</div>
            <div className="text-[10px] text-muted-foreground">Potential Savings</div>
          </div>
          <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 text-center">
            <Zap className="h-5 w-5 text-accent mx-auto mb-1.5" />
            <div className="text-lg font-extrabold text-accent">{totalItems}</div>
            <div className="text-[10px] text-muted-foreground">Automations Found</div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1.5" />
            <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{report.quickWins.length}</div>
            <div className="text-[10px] text-muted-foreground">Quick Wins</div>
          </div>
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
            <Rocket className="h-5 w-5 text-purple-600 dark:text-purple-400 mx-auto mb-1.5" />
            <div className="text-lg font-extrabold text-purple-600 dark:text-purple-400">{report.strategic.length}</div>
            <div className="text-[10px] text-muted-foreground">Strategic Goals</div>
          </div>
        </motion.div>

        {/* Report Sections */}
        <ReportSection
          title="Quick Wins"
          subtitle="Start these this week — easy setup, immediate impact"
          icon={CheckCircle2}
          items={report.quickWins}
          baseDelay={0.4}
          accentClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
        />

        <ReportSection
          title="Medium-Term Opportunities"
          subtitle="Implement over the next 1-3 months for sustained gains"
          icon={TrendingUp}
          items={report.mediumTerm}
          baseDelay={0.7}
          accentClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        />

        <ReportSection
          title="Strategic Automations"
          subtitle="Plan for 3-12 months — transformative long-term impact"
          icon={Rocket}
          items={report.strategic}
          baseDelay={1.0}
          accentClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
        />

        {/* Starting Point */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.3 }}
          className="mb-10 p-6 rounded-2xl bg-primary text-primary-foreground"
        >
          <div className="flex items-center gap-2 mb-3">
            <ArrowRight className="h-5 w-5" />
            <h3 className="text-base font-bold">Your Recommended Starting Point</h3>
          </div>
          <h4 className="text-lg font-extrabold mb-3">{report.startingPoint.title}</h4>
          <div className="text-sm leading-relaxed opacity-90 whitespace-pre-line">
            {report.startingPoint.instructions.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-bold text-primary-foreground">{part.slice(2, -2)}</strong>;
              }
              return <span key={i}>{part}</span>;
            })}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          className="text-center py-8"
        >
          <p className="text-sm text-muted-foreground mb-4">
            Want to explore different automation scenarios?
          </p>
          <Button
            data-testid="button-start-over"
            onClick={() => {
              delete (window as any).__automateiq_report;
              navigate("/chat");
            }}
            variant="outline"
            className="gap-2"
          >
            <Zap className="h-4 w-4" />
            Start a New Analysis
          </Button>
        </motion.div>

        {/* Footer */}
        <footer className="py-6 border-t border-border/50 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
            <AutomateIQLogo className="h-4 w-4 text-primary" />
            <span>Generated by AutomateIQ</span>
          </div>
          <a
            href="https://www.perplexity.ai/computer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Created with Perplexity Computer
          </a>
        </footer>
      </div>
    </div>
  );
}
