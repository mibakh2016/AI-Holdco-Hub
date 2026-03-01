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
    <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] max-w-5xl mx-auto text-black">
      {/* Glowing search header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full mb-10"
      >
        <div className="relative">
          <div className="relative rounded-2xl border border-border bg-card p-8 shadow-sm">
            <div className="flex items-center gap-5 mb-6">
              <div className="flex h-13 w-13 items-center justify-center rounded-xl bg-primary/10 ring-2 ring-primary/20">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold text-black">Assistant</p>
                <p className="text-sm text-black">AI-powered answers from your company info, portfolio holdings and fin docs.</p>
              </div>
              <Badge variant="default" className="ml-auto text-sm px-3 py-1">RAG-Powered</Badge>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-3">
              <div className="relative flex-1">
                <Input
                  placeholder="Ask about your company info..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  className="pr-4 h-14 rounded-xl border-primary/20 bg-amber-50 shadow-inner text-lg text-black placeholder:text-black focus-visible:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.25)]"
                />
              </div>
              <Button type="submit" size="icon" className="shrink-0 h-14 w-14 rounded-xl" disabled={isLoading}>
                <Send className="h-6 w-6" />
              </Button>
            </form>
          </div>
        </div>
      </motion.div>

      {/* Chat area */}
      <div className="flex-1 w-full overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
        <ScrollArea className="h-full p-sp-4">
          <div className="space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-28 text-center space-y-4">
                <p className="text-lg text-black">Ask questions about your company info</p>
                <p className="text-base text-black">AI searches through all indexed documents to find relevant answers with citations</p>
              </div>
            )}
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] space-y-2 ${msg.role === "user" ? "text-right" : ""}`}>
                    <div className={`inline-block rounded-lg px-6 py-4 text-lg leading-relaxed ${
                      msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-black"
                    }`}>
                      {msg.text}
                    </div>
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {msg.citations.map((c) => (
                          <button
                            key={c.index}
                            className="flex items-center gap-2 text-base text-primary hover:underline font-medium bg-primary/5 rounded px-3 py-1.5"
                          >
                            <FileText className="h-4 w-4" />
                            [{c.document_title}{c.page ? ` — Page ${c.page}` : ""}]
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </motion.div>
              ))}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  </div>
                  <div className="inline-block rounded-lg px-6 py-4 text-lg bg-secondary text-black">
                    Searching documents and generating response…
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </div>

      <p className="text-sm text-black mt-5 text-center">
        AI answers are sourced exclusively from indexed documents with citations.
      </p>
    </div>
  );
}
