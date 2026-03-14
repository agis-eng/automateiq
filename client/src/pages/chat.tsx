import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowLeft, Sparkles, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { AutomateIQLogo } from "./landing";

export interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: number;
}

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
      <span className="text-xs text-muted-foreground ml-1">AutomateIQ is thinking...</span>
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
  const [messages, setMessages] = useState<Message[]>([]);
  // Conversation history for API calls (role + content only)
  const [conversationHistory, setConversationHistory] = useState<{role: string; content: string}[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [newestId, setNewestId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const exchangeCount = useRef(0);

  // Initialize with first AI message
  useEffect(() => {
    const initChat = async () => {
      setIsTyping(true);
      try {
        const res = await apiRequest("POST", "/api/chat", {
          messages: [],
        });
        const data = await res.json();
        const greetingMsg: Message = {
          id: 'greeting',
          role: 'assistant',
          content: data.message,
          timestamp: Date.now(),
        };
        setMessages([greetingMsg]);
        setConversationHistory([{ role: 'assistant', content: data.message }]);
        setNewestId('greeting');
      } catch (error) {
        // Fallback greeting if API fails
        const fallbackMsg: Message = {
          id: 'greeting',
          role: 'assistant',
          content: "Hey there! 👋 I'm your Business Automation Advisor.\n\nI'm going to ask you a few smart questions about your business and daily workflow, then give you a personalized AI automation roadmap — with specific tools, time savings estimates, and exactly where to start.\n\nMost business owners I work with discover they can save **10-15 hours per week** with the right automations.\n\nLet's dive in — **what kind of business do you run?**",
          timestamp: Date.now(),
        };
        setMessages([fallbackMsg]);
        setConversationHistory([{ role: 'assistant', content: fallbackMsg.content }]);
        setNewestId('greeting');
      }
      setIsTyping(false);
    };
    initChat();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  const sendMessage = useCallback(async () => {
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

    const newHistory = [...conversationHistory, { role: 'user', content: text }];
    setConversationHistory(newHistory);

    // Show typing indicator
    setIsTyping(true);
    exchangeCount.current++;

    try {
      const res = await apiRequest("POST", "/api/chat", {
        messages: newHistory,
      });
      const data = await res.json();

      // Update progress based on exchange count
      const newProgress = Math.min(100, Math.round((exchangeCount.current / 10) * 100));
      setProgress(newProgress);

      if (data.isComplete) {
        setIsComplete(true);
        // Strip GENERATE_REPORT from the message if present
        const cleanMessage = data.message.replace(/GENERATE_REPORT[\s\S]*/, '').trim();
        if (cleanMessage) {
          const aiMsg: Message = {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: cleanMessage,
            timestamp: Date.now(),
          };
          setMessages(prev => [...prev, aiMsg]);
          setConversationHistory(prev => [...prev, { role: 'assistant', content: data.message }]);
          setNewestId(aiMsg.id);
        }
        setProgress(100);
      } else {
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.message,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, aiMsg]);
        setConversationHistory(prev => [...prev, { role: 'assistant', content: data.message }]);
        setNewestId(aiMsg.id);
      }
    } catch (error: any) {
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "Sorry, I had a moment there. Could you try sending that again?",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
      setNewestId(errorMsg.id);
    }

    setIsTyping(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [input, isTyping, conversationHistory]);

  const generateReport = useCallback(async () => {
    setIsGeneratingReport(true);
    try {
      const res = await apiRequest("POST", "/api/generate-report", {
        messages: conversationHistory,
      });
      const data = await res.json();
      // Store report for the report page
      (window as any).__automateiq_report = data.report;
      navigate("/report");
    } catch (error) {
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "Sorry, I had trouble generating your report. Let me try again — click the button once more.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
      setNewestId(errorMsg.id);
      setIsGeneratingReport(false);
    }
  }, [conversationHistory, navigate]);

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
                <div className="text-[11px] text-muted-foreground leading-tight">AI-Powered Business Advisor</div>
              </div>
            </div>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">GPT-4o Live</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-4 pb-2 max-w-3xl mx-auto">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span>Discovery Progress</span>
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

          {/* Generate Report Button */}
          {isComplete && !isGeneratingReport && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center py-4"
            >
              <Button
                data-testid="button-generate-report"
                onClick={generateReport}
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 gap-2"
              >
                <Sparkles className="h-5 w-5" />
                Generate My Automation Report
              </Button>
            </motion.div>
          )}

          {/* Generating report spinner */}
          {isGeneratingReport && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3 py-6"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Generating your personalized automation report...</p>
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
                placeholder={isComplete ? "Report is ready! Click the button above." : "Type your response..."}
                disabled={isTyping || isComplete || isGeneratingReport}
                className="w-full px-4 py-3 rounded-xl border border-border/60 bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all disabled:opacity-50"
              />
            </div>
            <Button
              data-testid="button-send"
              onClick={sendMessage}
              disabled={!input.trim() || isTyping || isComplete || isGeneratingReport}
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
            Powered by GPT-4o · Your responses are used to generate personalized recommendations
          </p>
        </div>
      </div>
    </div>
  );
}
