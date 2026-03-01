import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: LucideIcon;
  delay?: number;
}

export function StatCard({ label, value, change, changeType = "neutral", icon: Icon, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-card rounded-xl p-5"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="stat-value text-foreground">{value}</p>
          {change && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              changeType === "up" && "text-chart-up",
              changeType === "down" && "text-chart-down",
              changeType === "neutral" && "text-muted-foreground"
            )}>
              {changeType === "up" && <TrendingUp className="h-3 w-3" />}
              {changeType === "down" && <TrendingDown className="h-3 w-3" />}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </motion.div>
  );
}
