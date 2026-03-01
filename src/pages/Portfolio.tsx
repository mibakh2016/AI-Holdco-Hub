import { motion } from "framer-motion";
import { portfolioVentures } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Layers } from "lucide-react";

export default function Portfolio() {
  return (
    <div className="space-y-sp-4 max-w-5xl">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-muted-foreground">
        Portfolio companies owned and operated by Nexus AI Holdings.
      </motion.p>

      <div className="grid gap-sp-4 sm:grid-cols-2">
        {portfolioVentures.map((v, i) => (
          <motion.div
            key={v.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-lg p-sp-4 group cursor-pointer transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                  <Layers className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{v.name}</h3>
                  <Badge variant="default" className="text-[10px] mt-1">{v.sector}</Badge>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">{v.description}</p>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground">Holding stake</span>
              <span className="font-bold text-primary">{v.stakePercent}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${v.stakePercent}%` }}
                transition={{ duration: 0.5, delay: i * 0.05 + 0.15 }}
                className="h-full rounded-full bg-primary"
              />
            </div>
            <p className="text-[11px] text-status-success mt-3 font-medium">🎯 {v.milestone}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
