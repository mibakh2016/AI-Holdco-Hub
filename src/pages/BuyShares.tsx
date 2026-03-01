import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { holdingCompany } from "@/lib/mock-data";

const unitPrice = holdingCompany.unitPrice;
const blockSizes = [2, 4, 10];

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(v);

export default function BuyShares() {
  const [selected, setSelected] = useState<number>(0);
  const [agreed, setAgreed] = useState(false);

  const totalCost = blockSizes[selected] * unitPrice;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Agreement Section */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-lg p-6">
        <h2 className="font-bold text-lg mb-1">Equity Units Agreement</h2>
        <p className="text-sm text-primary font-medium mb-4">
          Please read and accept the Share Units purchase agreement before proceeding.
        </p>

        <div className="border rounded-md p-5 max-h-56 overflow-y-auto bg-background text-sm leading-relaxed text-foreground space-y-4 mb-5">
          <h3 className="font-bold text-base">Equity Units Purchase Agreement</h3>
          <p className="text-muted-foreground">
            This Share Units Purchase Agreement ("Agreement") is entered into by and between the Shareholder ("Buyer") and {holdingCompany.name} (the "Company"), effective as of the date of acceptance.
          </p>
          <h4 className="font-semibold">1. Definitions</h4>
          <p className="text-muted-foreground">
            <strong>Share Units:</strong> Represents fractional ownership interest in {holdingCompany.name}. Each unit entitles the holder to a proportional share of the Company's net asset value and voting rights as outlined in the Operating Agreement.
          </p>
          <h4 className="font-semibold">2. Purchase Terms</h4>
          <p className="text-muted-foreground">
            The Buyer agrees to purchase the specified number of Share Units at the current unit price as determined by the Company's most recent valuation. All purchases are subject to administrative approval and compliance review.
          </p>
          <h4 className="font-semibold">3. Payment</h4>
          <p className="text-muted-foreground">
            Payment shall be made in full at the time of purchase via approved payment methods. The Company reserves the right to reject or refund any purchase that does not meet compliance requirements.
          </p>
          <h4 className="font-semibold">4. Transfer Restrictions</h4>
          <p className="text-muted-foreground">
            Share Units are subject to transfer restrictions as outlined in the Company's Operating Agreement. No transfer of units may be made without prior written consent of the Company's Board of Directors.
          </p>
          <h4 className="font-semibold">5. Representations & Warranties</h4>
          <p className="text-muted-foreground">
            The Buyer represents that they are an accredited investor as defined under Regulation D of the Securities Act of 1933, and that this purchase is made for investment purposes only, not with a view toward resale or distribution.
          </p>
          <h4 className="font-semibold">6. Risk Factors</h4>
          <p className="text-muted-foreground">
            Investment in Share Units involves significant risk, including the potential loss of the entire investment. Past performance is not indicative of future results. The Buyer acknowledges having reviewed all risk disclosures provided by the Company.
          </p>
          <h4 className="font-semibold">7. Governing Law</h4>
          <p className="text-muted-foreground">
            This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law principles.
          </p>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} />
          <span className="text-sm text-foreground">
            I have read and agree to the Share Units purchase agreement
          </span>
        </label>
      </motion.div>

      {/* Purchase Information */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-lg p-6">
        <h2 className="font-bold text-lg mb-1">Purchase Information</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Current price per Share Unit: <span className="font-semibold text-foreground">{fmt(unitPrice)}</span>
        </p>

        <h3 className="font-semibold text-sm mb-3">Select Block Size</h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
          {blockSizes.map((units, i) => (
            <button
              key={units}
              onClick={() => setSelected(i)}
              className={cn(
                "rounded-lg border-2 py-3 px-2 text-center text-sm font-semibold transition-all",
                selected === i
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/50"
              )}
            >
              {units} Units
            </button>
          ))}
        </div>

        <div className="space-y-3 border-t pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Price per Share Unit:</span>
            <span className="font-medium text-foreground">{fmt(unitPrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Number of units:</span>
            <span className="font-medium text-foreground">{blockSizes[selected]}</span>
          </div>
          <div className="flex justify-between text-base font-bold border-t pt-3">
            <span>Total cost:</span>
            <span>{fmt(totalCost)}</span>
          </div>
        </div>
      </motion.div>

      <Button disabled={!agreed} className="gap-2 w-full sm:w-auto" size="lg">
        <CreditCard className="h-4 w-4" />
        Proceed to Checkout — {fmt(totalCost)}
      </Button>
    </div>
  );
}
