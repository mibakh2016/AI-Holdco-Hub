import { motion } from "framer-motion";
import { Percent, DollarSign, TrendingUp, Calendar, ArrowUpRight, FileText, Bot } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { shareholderData, holdingCompany, holdings } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

const changePercent = (
  ((shareholderData.totalValue - shareholderData.previousValue) / shareholderData.previousValue) * 100
).toFixed(1);

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
        <h2 className="font-display text-2xl font-bold tracking-tight">Good morning, Maria</h2>
        <p className="text-muted-foreground text-sm">Here's your holdings summary for {holdingCompany.name}.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ownership" value={`${shareholderData.ownershipPercent}%`} icon={Percent} delay={0} />
        <StatCard
          label="Holdings Value"
          value={formatCurrency(shareholderData.totalValue)}
          change={`+${changePercent}% from last quarter`}
          changeType="up"
          icon={DollarSign}
          delay={0.05}
        />
        <StatCard
          label="Company Valuation"
          value={formatCurrency(holdingCompany.currentValuation)}
          change={`+${(((holdingCompany.currentValuation - holdingCompany.previousValuation) / holdingCompany.previousValuation) * 100).toFixed(1)}%`}
          changeType="up"
          icon={TrendingUp}
          delay={0.1}
        />
        <StatCard
          label="Total Invested"
          value={formatCurrency(shareholderData.totalInvested)}
          icon={Calendar}
          delay={0.15}
        />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4 sm:grid-cols-3"
      >
        <button
          onClick={() => navigate("/holdings")}
          className="glass-card rounded-xl p-5 text-left hover:border-primary/30 transition-all group"
        >
          <FileText className="h-5 w-5 text-primary mb-3" />
          <h3 className="font-display font-semibold text-sm mb-1">View Holdings</h3>
          <p className="text-xs text-muted-foreground">Review your investment tranches and documents</p>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground mt-3 group-hover:text-primary transition-colors" />
        </button>
        <button
          onClick={() => navigate("/ai-assistant")}
          className="glass-card rounded-xl p-5 text-left hover:border-primary/30 transition-all group"
        >
          <Bot className="h-5 w-5 text-accent mb-3" />
          <h3 className="font-display font-semibold text-sm mb-1">AI Assistant</h3>
          <p className="text-xs text-muted-foreground">Ask questions about your governance documents</p>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground mt-3 group-hover:text-accent transition-colors" />
        </button>
        <button
          onClick={() => navigate("/portfolio")}
          className="glass-card rounded-xl p-5 text-left hover:border-primary/30 transition-all group"
        >
          <TrendingUp className="h-5 w-5 text-amber mb-3" />
          <h3 className="font-display font-semibold text-sm mb-1">Portfolio</h3>
          <p className="text-xs text-muted-foreground">Explore the ventures in our portfolio</p>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground mt-3 group-hover:text-amber transition-colors" />
        </button>
      </motion.div>

      {/* Recent Tranches */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card rounded-xl"
      >
        <div className="p-5 border-b">
          <h3 className="font-display font-semibold">Recent Investment Tranches</h3>
        </div>
        <div className="divide-y">
          {holdings.map((h) => (
            <div key={h.id} className="flex items-center justify-between p-5">
              <div className="space-y-1">
                <p className="text-sm font-medium">{h.units} units — {h.percent}% ownership</p>
                <p className="text-xs text-muted-foreground">Invested {new Date(h.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm font-semibold font-display">{formatCurrency(h.currentValue)}</p>
                <p className="text-xs text-chart-up">+{formatCurrency(h.currentValue - h.paidPrice)}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
