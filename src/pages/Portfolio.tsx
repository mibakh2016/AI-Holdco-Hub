import { motion } from "framer-motion";
import { portfolioVentures } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Layers, TrendingUp, ExternalLink } from "lucide-react";

const sectorColors: Record<string, string> = {
  Healthcare: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Fintech: "bg-blue-100 text-blue-700 border-blue-200",
  Enterprise: "bg-amber-100 text-amber-700 border-amber-200",
  "Legal Tech": "bg-purple-100 text-purple-700 border-purple-200",
};


export default function Portfolio() {
  return (
    <div className="space-y-sp-4 max-w-6xl">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-muted-foreground">
        Portfolio companies owned and operated by Nexus AI Holdings.
      </motion.p>

      <div className="grid gap-sp-4 sm:grid-cols-2 lg:grid-cols-3">
        {portfolioVentures.map((v, i) => (
          <motion.div
            key={v.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card rounded-lg border-2 border-primary/20 hover:border-primary/50 transition-colors p-sp-6 flex flex-col gap-4"
          >
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                <Layers className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">{v.name}</h3>
                <Badge className={`text-[10px] mt-1 border ${sectorColors[v.sector] ?? "bg-muted text-muted-foreground"}`}>{v.sector}</Badge>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-foreground leading-relaxed">{v.description}</p>

            {/* Stats */}
            <div className="mt-auto space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-foreground">Holding Stake:</span>
                <span className="font-bold text-primary">{v.stakePercent}%</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <TrendingUp className="h-3.5 w-3.5 text-status-success shrink-0" />
                <span className="font-semibold text-foreground">Latest Milestone:</span>
                <span className="text-muted-foreground text-right ml-auto">{v.milestone}</span>
              </div>
              <a href={v.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-2">
                <ExternalLink className="h-3 w-3" /> Website
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
