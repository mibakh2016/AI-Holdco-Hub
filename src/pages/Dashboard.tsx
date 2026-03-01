import { motion } from "framer-motion";
import { shareholderData } from "@/lib/mock-data";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

const changePercent = (
  ((shareholderData.totalValue - shareholderData.previousValue) / shareholderData.previousValue) * 100
).toFixed(1);

export default function Dashboard() {
  return (
    <div className="max-w-6xl">
      <div className="grid gap-sp-8 sm:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <p className="text-label mb-1">Ownership</p>
          <p className="stat-value text-foreground">{shareholderData.ownershipPercent}%</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
          <p className="text-label mb-1">Holdings Value</p>
          <p className="stat-value text-foreground">{formatCurrency(shareholderData.totalValue)}</p>
          <p className="text-xs text-status-success font-medium mt-1">+{changePercent}% from last quarter</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <p className="text-label mb-1">Total Invested</p>
          <p className="stat-value text-foreground">{formatCurrency(shareholderData.totalInvested)}</p>
        </motion.div>
      </div>
    </div>
  );
}
