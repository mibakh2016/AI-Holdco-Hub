import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Loader2, CheckCircle2, Link2, Calendar, User, Building2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const CATEGORY_LABELS: Record<string, string> = {
  investment_agreement: "Investment Agreement",
  subscription_agreement: "Subscription Agreement",
  purchase_agreement: "Purchase Agreement",
  ppm: "PPM",
  valuation_report: "Valuation Report",
  board_resolution: "Board Resolution",
  sec_filing: "SEC Filing",
  shareholder_record: "Shareholder Record",
  portfolio_entity_record: "Portfolio Entity Record",
  financial_report: "Financial Report",
  meeting_minutes: "Meeting Minutes",
  bylaws: "Bylaws",
  operating_agreement: "Operating Agreement",
  annual_report: "Annual Report",
  tax_document: "Tax Document",
  general: "General",
};

interface DocumentConfirmDialogProps {
  documentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DocumentConfirmDialog({ documentId, open, onOpenChange }: DocumentConfirmDialogProps) {
  const queryClient = useQueryClient();

  const { data: doc } = useQuery({
    queryKey: ["document-detail", documentId],
    queryFn: async () => {
      if (!documentId) return null;
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("id", documentId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!documentId && open,
    refetchInterval: (query) => {
      const status = (query.state.data as any)?.processing_status;
      return open && (status === "pending" || status === "extracting" || !status) ? 2000 : false;
    },
    staleTime: 0,
  });

  const { data: shareholders } = useQuery({
    queryKey: ["shareholders-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("shareholders").select("id, full_name").order("full_name");
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const { data: entities } = useQuery({
    queryKey: ["entities-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("portfolio_entities").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const { data: valuations } = useQuery({
    queryKey: ["valuations-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("valuations").select("id, valuation_date, total_valuation").order("valuation_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const aiMeta = (doc as any)?.ai_suggested_metadata as Record<string, any> | null;

  const [docType, setDocType] = useState("");
  const [shareholderId, setShareholderId] = useState("none");
  const [entityId, setEntityId] = useState("none");
  const [valuationId, setValuationId] = useState("none");
  const [effectiveDate, setEffectiveDate] = useState("");

  // Initialize from AI suggestions when doc loads
  const [initialized, setInitialized] = useState<string | null>(null);
  if (doc && initialized !== doc.id) {
    setDocType(doc.document_type || aiMeta?.suggested_type || "general");
    setEffectiveDate(aiMeta?.suggested_effective_date || "");
    setShareholderId("none");
    setEntityId("none");
    setValuationId("none");
    setInitialized(doc.id);
  }

  const confirmMutation = useMutation({
    mutationFn: async () => {
      if (!documentId) throw new Error("No document");
      const { error } = await supabase
        .from("documents")
        .update({
          document_type: docType,
          shareholder_id: shareholderId === "none" ? null : shareholderId,
          entity_id: entityId === "none" ? null : entityId,
          valuation_id: valuationId === "none" ? null : valuationId,
          effective_date: effectiveDate || null,
          confirmed_at: new Date().toISOString(),
          processing_status: "confirmed",
          status: "published",
        })
        .eq("id", documentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
      toast.success("Document confirmed and published");
      onOpenChange(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const processing = (doc as any)?.processing_status;
  const isProcessing = processing === "extracting" || processing === "pending" || !processing;
  const isFailed = processing === "failed";
  const isReady =
    !!doc &&
    (processing === "awaiting_confirmation" ||
      processing === "confirmed" ||
      processing === "failed");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Review & Confirm Document
          </DialogTitle>
          <DialogDescription>
            {doc?.title || "Loading..."}
          </DialogDescription>
        </DialogHeader>

        {isProcessing && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm font-medium">Processing document…</p>
            <p className="text-xs text-muted-foreground">AI is extracting text and suggesting metadata</p>
          </div>
        )}

        {isFailed && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 space-y-1">
            <p className="text-sm font-medium text-destructive">Processing failed</p>
            <p className="text-xs text-muted-foreground">
              AI extraction failed, but you can still review fields manually and confirm this document.
            </p>
          </div>
        )}

        {isReady && doc && (
          <div className="space-y-4">
            {/* AI Summary */}
            {aiMeta?.summary && (
              <div className="rounded-lg border bg-accent/50 p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">AI Summary</Badge>
                  <Badge variant={aiMeta.confidence === "high" ? "default" : "secondary"} className="text-[10px]">
                    {aiMeta.confidence} confidence
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{aiMeta.summary}</p>
              </div>
            )}

            {/* Document Type */}
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-1">
                <FileText className="h-3 w-3" /> Document Type
                {aiMeta?.suggested_type && <Badge variant="outline" className="text-[9px] ml-1">AI-suggested</Badge>}
              </Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Effective Date */}
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Effective Date
                {aiMeta?.suggested_effective_date && <Badge variant="outline" className="text-[9px] ml-1">AI-suggested</Badge>}
              </Label>
              <Input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
              />
            </div>

            {/* Link to Shareholder */}
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-1">
                <User className="h-3 w-3" /> Link to Shareholder
                {aiMeta?.suggested_shareholder_name && (
                  <span className="text-[10px] text-muted-foreground ml-1">
                    (suggested: {aiMeta.suggested_shareholder_name})
                  </span>
                )}
              </Label>
              <Select value={shareholderId} onValueChange={setShareholderId}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {shareholders?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Link to Entity */}
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-1">
                <Building2 className="h-3 w-3" /> Link to Portfolio Entity
                {aiMeta?.suggested_entity_name && (
                  <span className="text-[10px] text-muted-foreground ml-1">
                    (suggested: {aiMeta.suggested_entity_name})
                  </span>
                )}
              </Label>
              <Select value={entityId} onValueChange={setEntityId}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {entities?.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Link to Valuation */}
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-1">
                <Link2 className="h-3 w-3" /> Link to Valuation
              </Label>
              <Select value={valuationId} onValueChange={setValuationId}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {valuations?.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {format(new Date(v.valuation_date), "MMM d, yyyy")} — ${Number(v.total_valuation).toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          {isReady && (
            <Button onClick={() => confirmMutation.mutate()} disabled={confirmMutation.isPending}>
              {confirmMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Confirming…</>
              ) : (
                <><CheckCircle2 className="h-4 w-4 mr-2" /> Confirm & Publish</>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
