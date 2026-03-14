import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Zap, BarChart3, CheckCircle2, Sparkles, Users, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";

// Animated floating shapes for background
function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-[0.04] dark:opacity-[0.06]"
          style={{
            background: i % 2 === 0
              ? 'hsl(163, 88%, 17%)'
              : 'hsl(38, 80%, 47%)',
            width: `${80 + i * 60}px`,
            height: `${80 + i * 60}px`,
            left: `${10 + i * 15}%`,
            top: `${5 + (i % 3) * 30}%`,
          }}
          animate={{
            y: [0, -30, 0, 30, 0],
            x: [0, 20, 0, -20, 0],
            scale: [1, 1.1, 1, 0.9, 1],
          }}
          transition={{
            duration: 12 + i * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 1.5,
          }}
        />
      ))}
    </div>
  );
}

// Animated counter
function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const FEATURES = [
  {
    icon: <Zap className="h-5 w-5" />,
    title: "Smart Discovery",
    desc: "Intelligent questions that map your specific workflow to automation opportunities"
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Time Savings Analysis",
    desc: "Precise estimates of hours saved per week for every recommendation"
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "Personalized Roadmap",
    desc: "Prioritized action plan with specific tools, difficulty levels, and next steps"
  },
];

const TESTIMONIALS = [
  { name: "Sarah M.", role: "Marketing Agency Owner", quote: "Found 12 hours of weekly savings I didn't know existed. Game changer." },
  { name: "James K.", role: "E-commerce Founder", quote: "The report identified my biggest bottleneck in under 5 minutes." },
  { name: "Diana R.", role: "Consultant", quote: "Finally, someone explains AI tools in a way that makes sense for my business." },
];

export default function LandingPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <FloatingShapes />

        {/* Gradient mesh background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 dark:from-primary/10 dark:to-accent/10" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <AutomateIQLogo className="h-10 w-10 text-primary" />
            <span className="text-xl font-bold tracking-tight text-foreground">AutomateIQ</span>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Sparkles className="h-3.5 w-3.5" />
              Free AI-Powered Business Analysis
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-foreground mb-6"
          >
            Find out exactly where AI can save your business{" "}
            <span className="text-primary">10+ hours a week</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Answer a few questions about your daily workflow and get a personalized automation roadmap — 
            with specific tools, time savings estimates, and exactly where to start.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col items-center gap-4"
          >
            <Button
              data-testid="cta-start"
              onClick={() => navigate("/chat")}
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground text-base font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Get My Free Automation Report
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Timer className="h-3.5 w-3.5" />
              Takes about 5 minutes · No signup required
            </p>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 flex items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span><strong className="text-foreground">2,500+</strong> business owners helped</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-border" />
            <div className="hidden sm:flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span><strong className="text-foreground">15,000+</strong> hours saved weekly</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-t border-border/50 bg-card/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { value: 12, suffix: "+", label: "Avg. hours saved per week" },
              { value: 85, suffix: "%", label: "Users implement within 7 days" },
              { value: 50, suffix: "+", label: "AI tools mapped & recommended" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="text-3xl font-extrabold text-primary mb-1">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Three simple steps to your personalized automation roadmap</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Tell Us About Your Business", desc: "Answer smart questions about your daily workflow, tools, and pain points." },
              { step: "02", title: "We Identify Opportunities", desc: "Our AI maps your specific workflow to proven automation solutions." },
              { step: "03", title: "Get Your Roadmap", desc: "Receive a prioritized action plan with tools, time savings, and next steps." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative p-6 rounded-xl border border-border/60 bg-card"
              >
                <div className="text-xs font-bold text-accent mb-3 tracking-wider">{item.step}</div>
                <h3 className="text-base font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-card/50 border-y border-border/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">What You Get</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">A comprehensive, actionable automation strategy tailored to your business</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex gap-4 p-5 rounded-xl border border-border/60 bg-background"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">What Business Owners Say</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="p-6 rounded-xl border border-border/60 bg-card"
              >
                <p className="text-sm text-foreground mb-4 leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="p-10 rounded-2xl bg-primary text-primary-foreground">
              <h2 className="text-2xl font-bold mb-3">Ready to Reclaim Your Time?</h2>
              <p className="text-primary-foreground/80 mb-6 text-sm leading-relaxed">
                Join 2,500+ business owners who've discovered exactly where AI can save them 10+ hours every week.
              </p>
              <Button
                data-testid="cta-start-bottom"
                onClick={() => navigate("/chat")}
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-5 rounded-xl"
              >
                Start My Free Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/50">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <AutomateIQLogo className="h-5 w-5 text-primary" />
            <span className="font-medium">AutomateIQ</span>
          </div>
          <a href="https://www.perplexity.ai/computer" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
            Created with Perplexity Computer
          </a>
        </div>
      </footer>
    </div>
  );
}

// SVG Logo — Stylized lightning bolt with circuit lines
export function AutomateIQLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-label="AutomateIQ logo"
    >
      {/* Outer hexagonal frame */}
      <path
        d="M20 2L35.32 10.5V27.5L20 36L4.68 27.5V10.5L20 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.3"
      />
      {/* Lightning bolt */}
      <path
        d="M22 8L13 22H19L17 32L28 17H21L22 8Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Circuit dots */}
      <circle cx="8" cy="14" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="32" cy="14" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="8" cy="26" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="32" cy="26" r="1.5" fill="currentColor" opacity="0.4" />
      {/* Circuit lines */}
      <line x1="9.5" y1="14" x2="13" y2="14" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <line x1="27" y1="14" x2="30.5" y2="14" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <line x1="9.5" y1="26" x2="14" y2="26" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <line x1="26" y1="26" x2="30.5" y2="26" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    </svg>
  );
}
