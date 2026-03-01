import { motion } from "framer-motion";
import { Users, FileText, DollarSign } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const [shareholdersRes, documentsRes, valuationsRes, pendingRes] = await Promise.all([
        supabase.from("shareholders").select("id", { count: "exact", head: true }),
        supabase.from("documents").select("id", { count: "exact", head: true }),
        supabase.from("valuations").select("total_valuation").order("valuation_date", { ascending: false }).limit(1),
        supabase.from("purchase_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      return {
        totalShareholders: shareholdersRes.count ?? 0,
        documentsIndexed: documentsRes.count ?? 0,
        latestValuation: valuationsRes.data?.[0]?.total_valuation ?? 0,
        pendingApprovals: pendingRes.count ?? 0,
      };
    },
  });

  return (
    <div className="space-y-sp-6 max-w-6xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">Admin Overview</h2>
        <p className="text-muted-foreground text-body">Manage shareholders, documents, and valuations.</p>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid gap-sp-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Total Shareholders" value={(stats?.totalShareholders ?? 0).toString()} icon={Users} delay={0} />
          <StatCard label="Documents Indexed" value={(stats?.documentsIndexed ?? 0).toString()} icon={FileText} delay={0.04} />
          <StatCard label="Holdings Value" value={fmt(2500000)} icon={DollarSign} delay={0.08} />
        </div>
      )}
    </div>
  );
}
