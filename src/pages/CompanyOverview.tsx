import { motion } from "framer-motion";
import { holdingCompany, capTable } from "@/lib/mock-data";
import { ExternalLink, Building2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

const barColors = [
  "bg-primary", "bg-primary/80", "bg-primary/60", "bg-accent", "bg-amber", "bg-muted-foreground/30",
];

export default function CompanyOverview() {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Company Info */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">{holdingCompany.name}</h2>
            <p className="text-sm text-muted-foreground">Holding Company</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{holdingCompany.description}</p>
        <div className="flex items-center gap-3 pt-2">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <ExternalLink className="h-3 w-3" /> SEC Filing
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <ExternalLink className="h-3 w-3" /> Etherscan
          </Button>
        </div>
      </motion.div>

      {/* Valuation */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="h-5 w-5 text-chart-up" />
          <h3 className="font-display font-semibold">Current Valuation</h3>
        </div>
        <p className="stat-value text-foreground">{fmt(holdingCompany.currentValuation)}</p>
        <p className="text-sm text-chart-up mt-1">
          +{(((holdingCompany.currentValuation - holdingCompany.previousValuation) / holdingCompany.previousValuation) * 100).toFixed(1)}% from previous quarter
        </p>
      </motion.div>

      {/* Cap Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl">
        <div className="p-5 border-b">
          <h3 className="font-display font-semibold">Ownership Distribution</h3>
          <p className="text-xs text-muted-foreground mt-1">Anonymized cap table</p>
        </div>
        <div className="p-5 space-y-4">
          {capTable.map((row, i) => (
            <div key={row.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className={cn("font-medium", row.isCurrentUser && "text-primary")}>{row.name}</span>
                <span className={cn("font-display font-semibold", row.isCurrentUser && "text-primary")}>{row.percent}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${row.percent}%` }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  className={cn("h-full rounded-full", row.isCurrentUser ? "bg-primary" : barColors[i % barColors.length])}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
