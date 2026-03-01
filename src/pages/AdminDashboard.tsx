import { motion } from "framer-motion";
import { Users, FileText, DollarSign, Clock, ArrowUpRight } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { adminStats, recentActivity } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

const activityIcons: Record<string, typeof FileText> = {
  valuation: DollarSign,
  document: FileText,
  shareholder: Users,
  purchase: ArrowUpRight,
};

const activityColors: Record<string, string> = {
  valuation: "bg-chart-up/10 text-chart-up",
  document: "bg-primary/10 text-primary",
  shareholder: "bg-accent/10 text-accent",
  purchase: "bg-amber/10 text-amber",
};

export default function AdminDashboard() {
  return (
    <div className="space-y-8 max-w-6xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
        <h2 className="font-display text-2xl font-bold tracking-tight">Admin Overview</h2>
        <p className="text-muted-foreground text-sm">Manage shareholders, documents, and valuations.</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Shareholders" value={adminStats.totalShareholders.toString()} icon={Users} delay={0} />
        <StatCard label="Documents Indexed" value={adminStats.documentsIndexed.toString()} icon={FileText} delay={0.05} />
        <StatCard label="Latest Valuation" value={fmt(adminStats.latestValuation)} icon={DollarSign} delay={0.1} />
        <StatCard
          label="Pending Approvals"
          value={adminStats.pendingApprovals.toString()}
          change="Requires attention"
          changeType="neutral"
          icon={Clock}
          delay={0.15}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-xl"
      >
        <div className="p-5 border-b">
          <h3 className="font-display font-semibold">Recent Activity</h3>
        </div>
        <div className="divide-y">
          {recentActivity.map((act) => {
            const Icon = activityIcons[act.type] || FileText;
            return (
              <div key={act.id} className="flex items-center gap-4 p-4">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${activityColors[act.type]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{act.action}</p>
                  <p className="text-xs text-muted-foreground truncate">{act.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{act.time}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
