import { motion } from "framer-motion";
import { holdings } from "@/lib/mock-data";
import { FileText, ExternalLink, Calendar, Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

export default function Holdings() {
  return (
    <div className="space-y-6 max-w-5xl">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-muted-foreground">
        All your investment tranches and linked legal documents.
      </motion.p>

      {holdings.map((tranche, i) => (
        <motion.div
          key={tranche.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="glass-card rounded-xl overflow-hidden"
        >
          <div className="p-5 border-b flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Coins className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm">Tranche — {tranche.units} Units</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <Calendar className="h-3 w-3" />
                  {new Date(tranche.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </div>
              </div>
            </div>
            <div className="flex gap-6 text-right">
              <div>
                <p className="text-xs text-muted-foreground">Ownership</p>
                <p className="font-display font-bold text-primary">{tranche.percent}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Paid</p>
                <p className="font-display font-semibold">{fmt(tranche.paidPrice)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current Value</p>
                <p className="font-display font-bold text-chart-up">{fmt(tranche.currentValue)}</p>
              </div>
            </div>
          </div>
          <div className="p-5">
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">Linked Documents</p>
            <div className="space-y-2">
              {tranche.documents.map((doc) => (
                <button
                  key={doc.id}
                  className="flex items-center gap-3 w-full rounded-lg border p-3 text-left hover:bg-muted/50 transition-colors"
                >
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.type} • {doc.date}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">PDF</Badge>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
