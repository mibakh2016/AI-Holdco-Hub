import { motion } from "framer-motion";
import { DollarSign, Save, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

export default function AdminValuations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: entities, isLoading } = useQuery({
    queryKey: ["portfolio-entities-valuation"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio_entities")
        .select("id, name, sector, valuation_amount")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (entities) {
      const initial: Record<string, string> = {};
      entities.forEach((e) => {
        initial[e.id] = e.valuation_amount?.toString() ?? "0";
      });
      setValues(initial);
    }
  }, [entities]);

  const total = Object.values(values).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updates = Object.entries(values).map(([id, val]) =>
        supabase.from("portfolio_entities").update({ valuation_amount: parseFloat(val) || 0 }).eq("id", id)
      );
      const results = await Promise.all(updates);
      const err = results.find((r) => r.error);
      if (err?.error) throw err.error;

      // Also save/update the valuations table with the total
      const { error } = await supabase.from("valuations").insert({
        total_valuation: total,
        unit_price: 0,
        valuation_date: new Date().toISOString().split("T")[0],
        status: "approved",
        methodology: "Sum of portfolio entity valuations",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-entities-valuation"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
      toast({ title: "Valuation saved", description: `Total: ${fmt(total)}` });
    },
    onError: (e: any) => {
      toast({ title: "Error saving", description: e.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-sp-6 max-w-4xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-heading font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            Valuation Management
          </h1>
          <p className="text-muted-foreground text-body">
            Assign values to each portfolio venture. The total equals the company valuation.
          </p>
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Valuation
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Portfolio Venture</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead className="text-right">Value (USD)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entities?.map((entity) => (
                <TableRow key={entity.id}>
                  <TableCell className="font-medium">{entity.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{entity.sector || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      className="w-40 ml-auto text-right"
                      value={values[entity.id] ?? "0"}
                      onChange={(e) => setValues((prev) => ({ ...prev, [entity.id]: e.target.value }))}
                      min={0}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {(!entities || entities.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                    No portfolio ventures found. Add ventures in the Portfolio section first.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2} className="font-bold text-base">
                  Total Company Valuation
                </TableCell>
                <TableCell className="text-right font-bold text-base text-primary">
                  {fmt(total)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </motion.div>
    </div>
  );
}
