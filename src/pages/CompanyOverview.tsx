import { motion } from "framer-motion";
import { holdingCompany, capTable } from "@/lib/mock-data";
import { ExternalLink, Building2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
const fmtPrice = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);

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
        <p className="text-sm text-foreground leading-relaxed">{holdingCompany.description}</p>
        <div className="text-sm font-semibold text-foreground space-y-1">
          <p>Unit Price – <span className="text-primary">{fmtPrice(holdingCompany.unitPrice)}</span></p>
          <p>Total Supply / Sold – <span className="font-bold">{holdingCompany.totalUnits.toLocaleString()}</span> / <span className="text-status-success font-bold">{holdingCompany.soldUnits.toLocaleString()}</span></p>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <Button variant="outline" size="sm" className="gap-2 text-xs" asChild>
            <a href={holdingCompany.websiteUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3" /> Website
            </a>
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-xs" asChild>
            <a href={holdingCompany.etherscanUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3" /> Etherscan
            </a>
          </Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} className="glass-card rounded-lg p-sp-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="h-5 w-5 text-status-success" />
          <h3 className="font-semibold">Current Holdings Value</h3>
        </div>
        <p className="stat-value text-foreground">{fmt(holdingCompany.currentValuation)}</p>
        <p className="text-sm text-status-success font-medium mt-1">
          +{(((holdingCompany.currentValuation - holdingCompany.previousValuation) / holdingCompany.previousValuation) * 100).toFixed(1)}% from previous quarter
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="glass-card rounded-lg">
        <div className="p-sp-4 border-b">
          <h3 className="font-semibold text-sm">Holders</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Holders: <span className="text-primary font-medium">{capTable.length}</span>
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Holder</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Equity Tokens</TableHead>
              <TableHead className="text-right">Share (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {capTable.map((row, i) => (
              <TableRow key={row.name}>
                <TableCell className={cn("font-medium", row.isCurrentUser && "text-primary")}>
                  <a href="#" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                    {row.name} <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell className="text-muted-foreground">{row.date ?? "—"}</TableCell>
                <TableCell className="text-right">{row.tokens?.toLocaleString() ?? "—"}</TableCell>
                <TableCell className={cn("text-right font-semibold", row.isCurrentUser ? "text-primary" : "text-status-success")}>{row.percent.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
