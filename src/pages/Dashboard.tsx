import { motion } from "framer-motion";
import { Percent, DollarSign, Calendar } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { shareholderData, holdingCompany } from "@/lib/mock-data";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

const changePercent = (
  ((shareholderData.totalValue - shareholderData.previousValue) / shareholderData.previousValue) * 100
).toFixed(1);

export default function Dashboard() {
  return (
    <div className="space-y-sp-6 max-w-6xl">
      <div className="grid gap-sp-4 sm:grid-cols-3">
        <StatCard label="Ownership" value={`${shareholderData.ownershipPercent}%`} icon={Percent} delay={0} />
        <StatCard
          label="Holdings Value"
          value={formatCurrency(shareholderData.totalValue)}
          change={`+${changePercent}% from last quarter`}
          changeType="up"
          icon={DollarSign}
          delay={0.04}
        />
        <StatCard label="Total Invested" value={formatCurrency(shareholderData.totalInvested)} icon={Calendar} delay={0.08} />
      </div>
    </div>
  );
}
