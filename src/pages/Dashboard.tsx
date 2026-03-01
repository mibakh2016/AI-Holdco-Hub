import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { shareholderData } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

interface PurchaseRequest {
  id: string;
  buyer_name: string;
  units: number;
  total_cost: number;
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const { data: myHoldingsValue = 0 } = useQuery({
    queryKey: ["my-holdings-value"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      // Get total holdings value
      const { data: entities } = await supabase.from("portfolio_entities").select("valuation_amount") as any;
      const totalValue = ((entities as { valuation_amount: number }[]) ?? [])
        .reduce((sum: number, e: { valuation_amount: number }) => sum + (e.valuation_amount ?? 0), 0);

      // Get this user's ownership percent
      const { data: shareholder } = await supabase
        .from("shareholders")
        .select("ownership_percent")
        .eq("user_id", user.id)
        .maybeSingle();

      const ownershipPercent = shareholder?.ownership_percent ?? 0;
      return totalValue * (ownershipPercent / 100);
    },
  });
  const [purchases, setPurchases] = useState<PurchaseRequest[]>([]);

  useEffect(() => {
    const fetchPurchases = async () => {
      const { data } = await supabase
        .from("purchase_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (data) setPurchases(data as PurchaseRequest[]);
    };
    fetchPurchases();

    // Realtime subscription
    const channel = supabase
      .channel("purchase_requests_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "purchase_requests" },
        (payload) => {
          setPurchases((prev) => [payload.new as PurchaseRequest, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="max-w-6xl space-y-8">
      <div className="grid gap-sp-8 sm:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <p className="text-sm font-medium text-foreground mb-1.5">Ownership</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{shareholderData.ownershipPercent}%</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
          <p className="text-sm font-medium text-foreground mb-1.5">My Holdings Value</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{formatCurrency(myHoldingsValue)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <p className="text-sm font-medium text-foreground mb-1.5">Total Invested</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{formatCurrency(shareholderData.totalInvested)}</p>
        </motion.div>
      </div>

      {/* Recent Purchase Requests */}
      {purchases.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <h2 className="font-bold text-lg mb-3">Recent Purchase Requests</h2>
          <div className="border rounded-lg divide-y">
            {purchases.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <span className="font-medium text-foreground">{p.buyer_name}</span>
                  <span className="text-muted-foreground ml-2">— {p.units} units</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-foreground">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(p.total_cost)}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground capitalize">{p.status}</span>
                  <span className="text-xs text-muted-foreground">{timeAgo(p.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
