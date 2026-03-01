import { motion } from "framer-motion";
import { portfolioVentures } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Layers } from "lucide-react";

const sectorColors: Record<string, string> = {
  Healthcare: "bg-accent/10 text-accent",
  Fintech: "bg-primary/10 text-primary",
  Enterprise: "bg-amber/10 text-amber",
  "Legal Tech": "bg-chart-up/10 text-chart-up",
};

export default function Portfolio() {
  return (
    <div className="space-y-6 max-w-5xl">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-muted-foreground">
        Portfolio companies owned and operated by Nexus AI Holdings.
      </motion.p>

      <div className="grid gap-4 sm:grid-cols-2">
        {portfolioVentures.map((v, i) => (
          <motion.div
            key={v.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card rounded-xl p-5 hover:border-primary/20 transition-all group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-sm">{v.name}</h3>
                  <Badge className={`text-[10px] mt-1 ${sectorColors[v.sector] || "bg-muted text-muted-foreground"}`} variant="secondary">
                    {v.sector}
                  </Badge>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">{v.description}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Holding stake</span>
              <span className="font-display font-bold text-primary">{v.stakePercent}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${v.stakePercent}%` }}
                transition={{ duration: 0.6, delay: i * 0.06 + 0.2 }}
                className="h-full rounded-full bg-primary"
              />
            </div>
            <p className="text-[11px] text-accent mt-3 font-medium">🎯 {v.milestone}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
