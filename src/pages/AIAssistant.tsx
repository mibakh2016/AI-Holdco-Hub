import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, FileText, Sparkles, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  citation?: { doc: string; section: string };
}

const sampleMessages: Message[] = [
  { id: "1", role: "user", text: "What are the terms of my subscription agreement?" },
  {
    id: "2",
    role: "assistant",
    text: "Based on your Series A Subscription Agreement dated March 15, 2024, you subscribed for 425 units representing 2.5% ownership at a price of $2,000 per unit. The agreement includes a 12-month lock-up period and standard anti-dilution protections. You also have pro-rata rights in subsequent funding rounds.",
    citation: { doc: "Subscription Agreement — Series A", section: "Section 2.1, Terms of Subscription" },
  },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", text: "I don't have enough information to answer this accurately — please contact management." },
      ]);
    }, 1200);
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
                    {msg.citation && (
                      <button className="flex items-center gap-2 text-xs text-primary hover:underline font-medium">
                        <FileText className="h-3 w-3" />
                        [{msg.citation.doc} — {msg.citation.section}]
                      </button>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>

        <div className="p-sp-4 border-t">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <Input placeholder="Ask about your governance documents..." value={input} onChange={(e) => setInput(e.target.value)} />
            <Button type="submit" size="icon" className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-[11px] text-muted-foreground mt-2 text-center">
            AI answers are sourced exclusively from verified documents. Any additional context is clearly flagged.
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
