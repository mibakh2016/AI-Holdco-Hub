import { motion } from "framer-motion";
import { Percent, DollarSign, TrendingUp, Calendar, ArrowUpRight, FileText, Bot } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { shareholderData, holdingCompany, holdings } from "@/lib/mock-data";
import { useNavigate } from "react-router-dom";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

const changePercent = (
  ((shareholderData.totalValue - shareholderData.previousValue) / shareholderData.previousValue) * 100
).toFixed(1);

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-sp-6 max-w-6xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">Good morning, Maria</h2>
        <p className="text-muted-foreground text-body">Here's your holdings summary for {holdingCompany.name}.</p>
      </motion.div>

      <div className="grid gap-sp-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ownership" value={`${shareholderData.ownershipPercent}%`} icon={Percent} delay={0} />
        <StatCard
          label="Holdings Value"
          value={formatCurrency(shareholderData.totalValue)}
          change={`+${changePercent}% from last quarter`}
          changeType="up"
          icon={DollarSign}
          delay={0.04}
        />
        <StatCard
          label="Company Valuation"
          value={formatCurrency(holdingCompany.currentValuation)}
          change={`+${(((holdingCompany.currentValuation - holdingCompany.previousValuation) / holdingCompany.previousValuation) * 100).toFixed(1)}%`}
          changeType="up"
          icon={TrendingUp}
          delay={0.08}
        />
        <StatCard label="Total Invested" value={formatCurrency(shareholderData.totalInvested)} icon={Calendar} delay={0.12} />
      </div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="grid gap-sp-4 sm:grid-cols-3">
        {[
          { icon: FileText, label: "View Holdings", desc: "Review your investment tranches and documents", route: "/holdings", color: "text-primary" },
          { icon: Bot, label: "AI Assistant", desc: "Ask questions about your governance documents", route: "/ai-assistant", color: "text-primary" },
          { icon: TrendingUp, label: "Portfolio", desc: "Explore the ventures in our portfolio", route: "/portfolio", color: "text-primary" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.route)}
            className="glass-card rounded-lg p-sp-4 text-left group transition-all"
          >
            <item.icon className={`h-5 w-5 ${item.color} mb-3`} />
            <h3 className="font-semibold text-sm mb-1">{item.label}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground mt-3 group-hover:text-primary transition-colors" />
          </button>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-lg">
        <div className="p-sp-4 border-b">
          <h3 className="font-semibold text-sm">Recent Investment Tranches</h3>
        </div>
        <div className="divide-y">
          {holdings.map((h) => (
            <div key={h.id} className="flex items-center justify-between p-sp-4">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{h.units} units — {h.percent}% ownership</p>
                <p className="text-xs text-muted-foreground">Invested {new Date(h.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
              </div>
              <div className="text-right space-y-0.5">
                <p className="text-sm font-semibold">{formatCurrency(h.currentValue)}</p>
                <p className="text-xs text-status-success font-medium">+{formatCurrency(h.currentValue - h.paidPrice)}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
