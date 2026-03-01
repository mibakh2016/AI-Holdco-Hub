import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, CreditCard, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const blockSizes = [
  { units: 50, price: 100_000 },
  { units: 100, price: 200_000 },
  { units: 250, price: 500_000 },
  { units: 500, price: 1_000_000 },
];

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

export default function BuyShares() {
  const [selected, setSelected] = useState<number | null>(null);
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-muted-foreground">
        Purchase additional share units in Nexus AI Holdings. All purchases require admin approval.
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6 space-y-4">
        <h3 className="font-display font-semibold">Select Block Size</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {blockSizes.map((block, i) => (
            <button
              key={block.units}
              onClick={() => setSelected(i)}
              className={cn(
                "rounded-xl border-2 p-4 text-left transition-all",
                selected === i ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              )}
            >
              <p className="font-display font-bold text-lg">{block.units} units</p>
              <p className="text-sm text-muted-foreground">{fmt(block.price)}</p>
              {selected === i && <CheckCircle2 className="h-5 w-5 text-primary mt-2" />}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-xl p-6 space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 accent-primary" />
          <span className="text-sm text-muted-foreground">
            I have read and agree to the Purchase Agreement and Private Placement Memorandum. I understand this purchase is subject to admin approval.
          </span>
        </label>
      </motion.div>

      <Button disabled={selected === null || !agreed} className="h-11 gap-2 w-full sm:w-auto">
        <CreditCard className="h-4 w-4" />
        Proceed to Checkout
        {selected !== null && <span>— {fmt(blockSizes[selected].price)}</span>}
      </Button>

      <Badge variant="outline" className="text-xs text-muted-foreground">
        <ShoppingCart className="h-3 w-3 mr-1" /> Status: No pending purchases
      </Badge>
    </div>
  );
}
