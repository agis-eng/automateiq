import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Clock, Zap, ArrowRight, Download, Copy, Share2,
  CheckCircle2, TrendingUp, Rocket, ArrowLeft, Check,
  Sparkles, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AutomateIQLogo } from "./landing";
import confetti from "canvas-confetti";

// Format report text with styling
function FormattedReport({ text }: { text: string }) {
  const lines = text.split('\n');

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim();

        // Section headers
        if (trimmed.startsWith('QUICK WINS') || trimmed.startsWith('## QUICK WINS') || trimmed.match(/^#+\s*QUICK WINS/i)) {
          return (
            <div key={i} className="flex items-center gap-3 pt-6 pb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">{trimmed.replace(/^#+\s*/, '')}</h3>
              </div>
            </div>
          );
        }

        if (trimmed.startsWith('MEDIUM-TERM') || trimmed.startsWith('## MEDIUM-TERM') || trimmed.match(/^#+\s*MEDIUM-TERM/i)) {
          return (
            <div key={i} className="flex items-center gap-3 pt-6 pb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">{trimmed.replace(/^#+\s*/, '')}</h3>
              </div>
            </div>
          );
        }

        if (trimmed.startsWith('STRATEGIC') || trimmed.startsWith('## STRATEGIC') || trimmed.match(/^#+\s*STRATEGIC/i)) {
          return (
            <div key={i} className="flex items-center gap-3 pt-6 pb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <Rocket className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">{trimmed.replace(/^#+\s*/, '')}</h3>
              </div>
            </div>
          );
        }

        if (trimmed.startsWith('TOTAL TIME SAVINGS') || trimmed.match(/^#+\s*TOTAL TIME SAVINGS/i)) {
          return (
            <div key={i} className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
              <Clock className="h-5 w-5 text-primary mx-auto mb-1.5" />
              <div className="text-lg font-extrabold text-primary">{trimmed.replace(/^(#+\s*)?TOTAL TIME SAVINGS:?\s*/i, '')}</div>
              <div className="text-xs text-muted-foreground">Estimated Weekly Savings</div>
            </div>
          );
        }

        if (trimmed.startsWith('RECOMMENDED FIRST STEP') || trimmed.match(/^#+\s*RECOMMENDED FIRST STEP/i)) {
          return (
            <div key={i} className="mt-6 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold text-primary">Recommended First Step</h3>
              </div>
              <div className="p-4 rounded-xl bg-primary text-primary-foreground">
                <p className="text-sm leading-relaxed">{trimmed.replace(/^(#+\s*)?RECOMMENDED FIRST STEP:?\s*/i, '')}</p>
              </div>
            </div>
          );
        }

        // Numbered items (automation recommendations)
        if (trimmed.match(/^\d+\.\s/)) {
          return (
            <div key={i} className="p-3 rounded-xl border border-border/60 bg-card ml-2">
              <p className="text-sm text-foreground leading-relaxed">
                {formatInlineMarkdown(trimmed)}
              </p>
            </div>
          );
        }

        // Bold lines (sub-items)
        if (trimmed.startsWith('**') || trimmed.startsWith('- **')) {
          return (
            <div key={i} className="p-3 rounded-xl border border-border/60 bg-card ml-2">
              <p className="text-sm text-foreground leading-relaxed">
                {formatInlineMarkdown(trimmed.replace(/^-\s*/, ''))}
              </p>
            </div>
          );
        }

        // Bullet points
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          return (
            <div key={i} className="flex items-start gap-2 ml-4 py-0.5">
              <Zap className="h-3 w-3 text-accent mt-1 flex-shrink-0" />
              <p className="text-sm text-muted-foreground leading-relaxed">{formatInlineMarkdown(trimmed.replace(/^[-•]\s*/, ''))}</p>
            </div>
          );
        }

        // Empty lines
        if (!trimmed) {
          return <div key={i} className="h-2" />;
        }

        // Regular text with possible section content for recommended first step continuation
        return (
          <p key={i} className="text-sm text-muted-foreground leading-relaxed ml-2">
            {formatInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

// Format inline markdown (bold, italic)
function formatInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function ReportPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [report, setReport] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data = (window as any).__automateiq_report as string | undefined;
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

  const handleDownload = () => {
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AutomateIQ-Automation-Report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Report downloaded!", description: "Check your downloads folder." });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      toast({ title: "Copied to clipboard!", description: "You can paste it anywhere." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Please try the download button instead.", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My AI Automation Roadmap', text: report });
      } catch { /* user cancelled */ }
    } else {
      handleCopy();
    }
  };

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
            AI-Generated Report
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">
            Your AI Automation Roadmap
          </h1>
          <p className="text-muted-foreground text-sm">
            Personalized recommendations powered by GPT-4o
          </p>
        </motion.div>

        {/* Report Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10"
        >
          <FormattedReport text={report} />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
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
            <span>Generated by AutomateIQ · Powered by GPT-4o</span>
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
