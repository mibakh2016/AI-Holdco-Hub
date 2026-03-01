import { motion } from "framer-motion";
import { Users, FileText, DollarSign, Clock, ArrowUpRight } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { adminStats, recentActivity } from "@/lib/mock-data";

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

const activityIcons: Record<string, typeof FileText> = {
  valuation: DollarSign,
  document: FileText,
  shareholder: Users,
  purchase: ArrowUpRight,
};

export default function AdminDashboard() {
  return (
    <div className="space-y-sp-6 max-w-6xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">Admin Overview</h2>
        <p className="text-muted-foreground text-body">Manage shareholders, documents, and valuations.</p>
      </motion.div>

      <div className="grid gap-sp-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Shareholders" value={adminStats.totalShareholders.toString()} icon={Users} delay={0} />
        <StatCard label="Documents Indexed" value={adminStats.documentsIndexed.toString()} icon={FileText} delay={0.04} />
        <StatCard label="Latest Valuation" value={fmt(adminStats.latestValuation)} icon={DollarSign} delay={0.08} />
        <StatCard label="Pending Approvals" value={adminStats.pendingApprovals.toString()} change="Requires attention" changeType="neutral" icon={Clock} delay={0.12} />
      </div>

    </div>
  );
}
