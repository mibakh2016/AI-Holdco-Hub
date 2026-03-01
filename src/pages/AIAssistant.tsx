import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, FileText, Sparkles, User, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface Citation {
  index: number;
  document_title: string;
  document_type: string;
  page: number | null;
  similarity: number;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  citations?: Citation[];
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = messages.map((m) => ({ role: m.role, text: m.text }));

      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: { message: input, conversation_history: conversationHistory },
      });

      if (error) throw error;

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: data.answer || "I could not generate a response.",
        citations: data.citations || [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("AI Assistant error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-sp-4 h-[calc(100vh-8rem)] max-w-6xl">
      <div className="flex-1 flex flex-col glass-card rounded-lg overflow-hidden">
        <div className="p-sp-4 border-b flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <Bot className="h-4 w-4 text-accent-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold">Document Assistant</p>
            <p className="text-[11px] text-muted-foreground">Answers from verified governance documents only</p>
          </div>
          <Badge variant="default" className="ml-auto text-[10px]">RAG-Powered</Badge>
        </div>

        <ScrollArea className="flex-1 p-sp-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                <Sparkles className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Ask questions about your governance documents</p>
                <p className="text-xs text-muted-foreground">AI searches through all indexed documents to find relevant answers with citations</p>
              </div>
            )}
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent">
                      <Sparkles className="h-3.5 w-3.5 text-accent-foreground" />
                    </div>
                  )}
                  <div className={`max-w-[80%] space-y-2 ${msg.role === "user" ? "text-right" : ""}`}>
                    <div className={`inline-block rounded-lg px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"
                    }`}>
                      {msg.text}
                    </div>
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {msg.citations.map((c) => (
                          <button
                            key={c.index}
                            className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium bg-primary/5 rounded px-2 py-1"
                          >
                            <FileText className="h-3 w-3" />
                            [{c.document_title}{c.page ? ` — Page ${c.page}` : ""}]
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                </motion.div>
              ))}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent">
                    <Loader2 className="h-3.5 w-3.5 text-accent-foreground animate-spin" />
                  </div>
                  <div className="inline-block rounded-lg px-4 py-3 text-sm bg-secondary text-muted-foreground">
                    Searching documents and generating response…
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-sp-4 border-t">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <Input
              placeholder="Ask about your governance documents..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" size="icon" className="shrink-0" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-[11px] text-muted-foreground mt-2 text-center">
            AI answers are sourced exclusively from indexed documents with citations.
          </p>
        </div>
      </div>

      <div className="hidden xl:flex w-[380px] glass-card rounded-lg items-center justify-center">
        <div className="text-center space-y-3 p-8">
          <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">Click a citation to preview the source document here</p>
        </div>
      </div>
    </div>
  );
}
