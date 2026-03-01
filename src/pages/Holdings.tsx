import { motion } from "framer-motion";
import { holdings } from "@/lib/mock-data";
import { FileText, Download } from "lucide-react";

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function Holdings() {
  return (
    <div className="max-w-4xl space-y-10">
      {holdings.map((tranche, i) => (
        <motion.div
          key={tranche.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
        >
          {/* Tranche header — simple row */}
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="text-base font-semibold">
              Tranche {i + 1}
              <span className="text-muted-foreground font-normal ml-2 text-sm">
                {fmtDate(tranche.date)}
              </span>
            </h3>
          </div>

          {/* Key figures — clean horizontal layout */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            <div>
              <p className="text-sm text-foreground mb-1">Units</p>
              <p className="text-lg font-semibold">{tranche.units}</p>
            </div>
            <div>
              <p className="text-sm text-foreground mb-1">Ownership</p>
              <p className="text-lg font-semibold">{tranche.percent}%</p>
            </div>
            <div>
              <p className="text-sm text-foreground mb-1">Invested</p>
              <p className="text-lg font-semibold">{fmt(tranche.paidPrice)}</p>
            </div>
            <div>
              <p className="text-sm text-foreground mb-1">Current Value</p>
              <p className="text-lg font-semibold text-status-success">{fmt(tranche.currentValue)}</p>
            </div>
          </div>

          {/* Documents — simple list */}
          <div>
            <p className="text-sm text-foreground mb-2">Linked Documents</p>
            <div className="space-y-1">
              {tranche.documents.map((doc) => (
                <button
                  key={doc.id}
                  className="flex items-center gap-3 w-full rounded-md px-3 py-2.5 text-left hover:bg-secondary transition-colors group"
                >
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium flex-1 truncate">{doc.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{doc.type}</span>
                  <Download className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Divider between tranches */}
          {i < holdings.length - 1 && <div className="border-b mt-8" />}
        </motion.div>
      ))}
    </div>
  );
}
