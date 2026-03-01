import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { holdingCompany, currentUser } from "@/lib/mock-data";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const unitPrice = holdingCompany.unitPrice;
const blockSizes = [2, 4, 10];

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(v);

export default function BuyShares() {
  const { user, profile } = useAuth();
  const [selected, setSelected] = useState<number>(0);
  const [agreed, setAgreed] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const totalCost = blockSizes[selected] * unitPrice;

  const handleSubmit = async () => {
    setConfirmOpen(false);
    try {
      const { error } = await supabase.from("purchase_requests").insert({
        user_id: user?.id,
        buyer_name: profile?.full_name || user?.email || "Unknown",
        buyer_email: user?.email || "",
        units: blockSizes[selected],
        unit_price: unitPrice,
        total_cost: totalCost,
      });
      if (error) throw error;
      setSubmitted(true);
      toast({
        title: "Purchase request submitted",
        description: `Your request for ${blockSizes[selected]} units (${fmt(totalCost)}) has been sent for admin approval.`,
      });
    } catch (err: any) {
      toast({
        title: "Error submitting purchase",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (submitted) {
    return (
      <div className="max-w-4xl">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-lg p-10 text-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
          <h2 className="font-bold text-xl">Purchase Request Submitted</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Your request for <span className="font-semibold text-foreground">{blockSizes[selected]} units</span> at{" "}
            <span className="font-semibold text-foreground">{fmt(totalCost)}</span> has been submitted and is pending admin approval.
            You'll be notified once it's processed.
          </p>
          <Button variant="outline" onClick={() => { setSubmitted(false); setAgreed(false); }}>
            Make Another Purchase
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Agreement Section */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-bold text-lg mb-1">Equity Units Agreement</h2>
        <p className="text-sm text-primary font-medium mb-4">
          Please read and accept the Equity Units purchase agreement before proceeding.
        </p>

        <div className="border rounded-md p-5 max-h-56 overflow-y-auto bg-accent/50 text-sm leading-relaxed text-foreground space-y-4 mb-5 ml-6">
          <h3 className="font-bold text-base">Equity Units Purchase Agreement</h3>
          <p className="text-muted-foreground">
            This Equity Units Purchase Agreement ("Agreement") is entered into by and between the Shareholder ("Buyer") and {holdingCompany.name} (the "Company"), effective as of the date of acceptance.
          </p>
          <h4 className="font-semibold">1. Definitions</h4>
          <p className="text-muted-foreground">
            <strong>Equity Units:</strong> Represents fractional ownership interest in {holdingCompany.name}. Each unit entitles the holder to a proportional share of the Company's net asset value and voting rights as outlined in the Operating Agreement.
          </p>
          <h4 className="font-semibold">2. Purchase Terms</h4>
          <p className="text-muted-foreground">
            The Buyer agrees to purchase the specified number of Equity Units at the current unit price as determined by the Company's most recent valuation. All purchases are subject to administrative approval and compliance review.
          </p>
          <h4 className="font-semibold">3. Payment</h4>
          <p className="text-muted-foreground">
            Payment shall be made in full at the time of purchase via approved payment methods. The Company reserves the right to reject or refund any purchase that does not meet compliance requirements.
          </p>
          <h4 className="font-semibold">4. Transfer Restrictions</h4>
          <p className="text-muted-foreground">
            Equity Units are subject to transfer restrictions as outlined in the Company's Operating Agreement. No transfer of units may be made without prior written consent of the Company's Board of Directors.
          </p>
          <h4 className="font-semibold">5. Representations & Warranties</h4>
          <p className="text-muted-foreground">
            The Buyer represents that they are an accredited investor as defined under Regulation D of the Securities Act of 1933, and that this purchase is made for investment purposes only, not with a view toward resale or distribution.
          </p>
          <h4 className="font-semibold">6. Risk Factors</h4>
          <p className="text-muted-foreground">
            Investment in Equity Units involves significant risk, including the potential loss of the entire investment. Past performance is not indicative of future results. The Buyer acknowledges having reviewed all risk disclosures provided by the Company.
          </p>
          <h4 className="font-semibold">7. Governing Law</h4>
          <p className="text-muted-foreground">
            This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law principles.
          </p>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} />
          <span className="text-sm font-medium text-foreground">
            I have read and agree to the Equity Units purchase agreement
          </span>
        </label>
      </motion.div>

      <div className="h-4" />

      {/* Purchase Information */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <h2 className="font-bold text-lg mb-1">Unit Price</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Current price per Equity Unit: <span className="font-semibold text-foreground">{fmt(unitPrice)}</span>
        </p>

        <h3 className="font-bold text-lg mt-10 mb-3">Select Block Size</h3>
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
            <span className="text-muted-foreground">Price per Equity Unit:</span>
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

      <Button disabled={!agreed} className="gap-2 w-full sm:w-auto" size="lg" onClick={() => setConfirmOpen(true)}>
        <CreditCard className="h-4 w-4" />
        Proceed to Checkout — {fmt(totalCost)}
      </Button>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>Please review your purchase details before submitting.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Buyer:</span>
              <span className="font-medium">{profile?.full_name || user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Units:</span>
              <span className="font-medium">{blockSizes[selected]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price per unit:</span>
              <span className="font-medium">{fmt(unitPrice)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-3">
              <span>Total:</span>
              <span>{fmt(totalCost)}</span>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSubmit}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> Confirm Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
