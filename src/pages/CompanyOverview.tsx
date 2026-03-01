import { motion } from "framer-motion";
import { holdingCompany, capTable } from "@/lib/mock-data";
import { ExternalLink, Building2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

export default function CompanyOverview() {
  return (
    <div className="space-y-sp-4 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-lg p-sp-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
            <Building2 className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{holdingCompany.name}</h2>
            <p className="text-sm text-muted-foreground">Holding Company</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{holdingCompany.description}</p>
        <div className="flex items-center gap-3 pt-1">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <ExternalLink className="h-3 w-3" /> SEC Filing
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <ExternalLink className="h-3 w-3" /> Etherscan
          </Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} className="glass-card rounded-lg p-sp-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="h-5 w-5 text-status-success" />
          <h3 className="font-semibold">Current Valuation</h3>
        </div>
        <p className="stat-value text-foreground">{fmt(holdingCompany.currentValuation)}</p>
        <p className="text-sm text-status-success font-medium mt-1">
          +{(((holdingCompany.currentValuation - holdingCompany.previousValuation) / holdingCompany.previousValuation) * 100).toFixed(1)}% from previous quarter
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="glass-card rounded-lg">
        <div className="p-sp-4 border-b">
          <h3 className="font-semibold text-sm">Ownership Distribution</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Anonymized cap table</p>
        </div>
        <div className="p-sp-4 space-y-4">
          {capTable.map((row, i) => (
            <div key={row.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-table">
                <span className={cn("font-medium", row.isCurrentUser && "text-primary")}>{row.name}</span>
                <span className={cn("font-bold", row.isCurrentUser && "text-primary")}>{row.percent}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${row.percent}%` }}
                  transition={{ duration: 0.5, delay: i * 0.04 }}
                  className={cn("h-full rounded-full", row.isCurrentUser ? "bg-primary" : "bg-primary/40")}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
