import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowLeft, Sparkles, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ConversationEngine, type Message } from "@/lib/conversation-engine";
import { AutomateIQLogo } from "./landing";

// Typing indicator component
function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary/60"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground ml-1">AutomateIQ is typing...</span>
    </div>
  );
}

// Typewriter effect for AI messages
function TypewriterText({ text, onComplete, speed = 12 }: { text: string; onComplete?: () => void; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        // Process in chunks of 2-4 characters for faster typing
        const chunkSize = Math.min(3, text.length - i);
        setDisplayed(text.slice(0, i + chunkSize));
        i += chunkSize;
      } else {
        clearInterval(interval);
        setDone(true);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return <span>{formatBoldMarkdown(done ? text : displayed)}{!done && <span className="animate-pulse">|</span>}</span>;
}

// Simple markdown bold formatting
function formatBoldMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
      return <em key={i} className="text-accent font-medium">{part.slice(1, -1)}</em>;
    }
    // Handle line breaks
    return part.split('\n').map((line, j) => (
      <span key={`${i}-${j}`}>
        {j > 0 && <br />}
        {line}
      </span>
    ));
  });
}

// Chat message component
function ChatMessage({ message, isNew }: { message: Message; isNew: boolean }) {
  const isUser = message.role === 'user';
  const [typewriterDone, setTypewriterDone] = useState(!isNew || isUser);

  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-1">
          <AutomateIQLogo className="h-5 w-5 text-primary" />
        </div>
      )}

      {/* Message bubble */}
      <div
        className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-md'
            : 'bg-card border border-border/60 text-foreground rounded-tl-md'
        }`}
      >
        {isUser ? (
          <span>{message.content}</span>
        ) : isNew && !typewriterDone ? (
          <TypewriterText text={message.content} onComplete={() => setTypewriterDone(true)} />
        ) : (
          <span>{formatBoldMarkdown(message.content)}</span>
        )}
      </div>
    </motion.div>
  );
}

export default function ChatPage() {
  const [, navigate] = useLocation();
  const [engine] = useState(() => new ConversationEngine());
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [newestId, setNewestId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [opportunityCount, setOpportunityCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with greeting
  useEffect(() => {
    const greeting = engine.getGreeting();
    const greetingMsg: Message = {
      id: 'greeting',
      role: 'assistant',
      content: greeting,
      timestamp: Date.now(),
    };
    setMessages([greetingMsg]);
    setNewestId('greeting');
  }, [engine]);

  // Auto-scroll to bottom
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || isTyping) return;

    // Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setNewestId(userMsg.id);
    setInput("");

    // Show typing indicator
    setIsTyping(true);

    // Process after delay to simulate thinking
    setTimeout(() => {
      const response = engine.processMessage(text);
      setProgress(engine.getProgress());
      setOpportunityCount(engine.getOpportunityCount());

      if (response === '__GENERATE_REPORT__') {
        // Generate report and navigate
        const report = engine.generateReport();
        // Store report data for the report page
        (window as any).__automateiq_report = report;
        setIsTyping(false);
        navigate("/report");
        return;
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setNewestId(aiMsg.id);
      setIsTyping(false);

      // Focus input after AI responds
      setTimeout(() => inputRef.current?.focus(), 100);
    }, 800 + Math.random() * 600);
  }, [input, isTyping, engine, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border/60 bg-background/80 backdrop-blur-md z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              data-testid="button-back"
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
                <div className="text-[11px] text-muted-foreground leading-tight">Business Automation Advisor</div>
              </div>
            </div>
          </div>

          {/* Opportunity counter */}
          <AnimatePresence>
            {opportunityCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20"
              >
                <Zap className="h-3.5 w-3.5 text-accent" />
                <span className="text-xs font-semibold text-accent">
                  {opportunityCount} {opportunityCount === 1 ? "opportunity" : "opportunities"} found
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="px-4 pb-2 max-w-3xl mx-auto">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isNew={msg.id === newestId}
              />
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <AutomateIQLogo className="h-5 w-5 text-primary" />
              </div>
              <div className="bg-card border border-border/60 rounded-2xl rounded-tl-md">
                <TypingIndicator />
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-border/60 bg-background/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                data-testid="input-message"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your response..."
                disabled={isTyping}
                className="w-full px-4 py-3 rounded-xl border border-border/60 bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all disabled:opacity-50"
              />
            </div>
            <Button
              data-testid="button-send"
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 rounded-xl h-auto"
            >
              {isTyping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Your responses are analyzed locally to generate personalized recommendations
          </p>
        </div>
      </div>
    </div>
  );
}
