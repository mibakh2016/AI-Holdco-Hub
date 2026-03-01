import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Building2, TrendingUp, ExternalLink, Loader2 } from "lucide-react";

export default function Portfolio() {
  const { data: entities, isLoading } = useQuery({
    queryKey: ["portfolio-entities-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio_entities")
        .select("*")
        .eq("status", "active")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const statusColor = (s: string) => {
    switch (s) {
      case "active": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "pipeline": return "bg-blue-100 text-blue-700 border-blue-200";
      case "exited": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-sp-4 max-w-6xl">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-black">
        Portfolio companies owned and operated by AI Holdco Hub.
      </motion.p>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : !entities?.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
          <Building2 className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-base text-muted-foreground">No portfolio entities available yet.</p>
        </div>
      ) : (
        <div className="grid gap-sp-4 sm:grid-cols-2 lg:grid-cols-3">
          {entities.map((entity, i) => (
            <motion.div
              key={entity.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card rounded-lg border-2 border-primary/20 hover:border-primary/50 transition-colors p-sp-6 flex flex-col gap-4"
            >
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-accent flex items-center justify-center overflow-hidden">
                  {(entity as any).logo_url ? (
                    <img src={(entity as any).logo_url} alt={entity.name} className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-5 w-5 text-accent-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight text-black">{entity.name}</h3>
                  {entity.sector && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {entity.sector.split(",").map((s, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px]">{s.trim()}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {entity.description && (
                <p className="text-xs text-black leading-relaxed">{entity.description}</p>
              )}

              {/* Stats */}
              <div className="mt-auto space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-black">Holding Stake:</span>
                  <span className="font-bold text-primary">{entity.stake_percent}%</span>
                </div>
                {entity.latest_milestone && (
                  <div className="flex items-center gap-2 text-xs">
                    <TrendingUp className="h-3.5 w-3.5 text-status-success shrink-0" />
                    <span className="font-semibold text-black">Latest Milestone:</span>
                    <span className="text-black text-right ml-auto">{entity.latest_milestone}</span>
                  </div>
                )}
                {entity.website_url && (
                  <a href={entity.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-2">
                    <ExternalLink className="h-3 w-3" /> Website
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
