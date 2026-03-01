import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, X, HardDrive, Monitor, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import DocumentLibrary from "@/components/admin/DocumentLibrary";
import DocumentConfirmDialog from "@/components/admin/DocumentConfirmDialog";

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
  shareholder_agreement: "Shareholder Agreement",
  bylaws: "Bylaws",
  operating_agreement: "Operating Agreement",
  annual_report: "Annual Report",
  tax_document: "Tax Document",
  meeting_minutes: "Meeting Minutes",
  general: "General",
};

export default function AdminDocuments() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmDocId, setConfirmDocId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped?.type === "application/pdf") {
      setFile(dropped);
    } else {
      toast.error("Only PDF files are accepted");
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected?.type === "application/pdf") {
      setFile(selected);
    } else if (selected) {
      toast.error("Only PDF files are accepted");
    }
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file selected");
      if (file.size > 50 * 1024 * 1024) throw new Error("File size exceeds 50MB");

      const path = `${crypto.randomUUID()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);

      const title = file.name.replace(/\.pdf$/i, "");
      const { data, error } = await supabase.from("documents").insert([{
        title,
        document_type: "general",
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_size: file.size,
        status: "pending",
      }]).select("id").single();
      if (error) throw error;

      return { documentId: data.id, title };
    },
    onSuccess: async ({ documentId, title }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
      toast.success("Document uploaded — processing…");
      setFile(null);

      // Trigger AI processing
      setIsProcessing(true);
      try {
        const { data, error } = await supabase.functions.invoke("process-document", {
          body: { document_id: documentId },
        });
        if (error) throw error;
        queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
        
        // Open confirmation dialog
        setConfirmDocId(documentId);
        setConfirmOpen(true);
        toast.success("AI processing complete — review & confirm");
      } catch (err) {
        console.error("Processing failed:", err);
        toast.error("Document processing failed — you can still confirm manually");
        setConfirmDocId(documentId);
        setConfirmOpen(true);
      } finally {
        setIsProcessing(false);
      }
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-10 px-4 py-6 max-w-5xl mx-auto">
      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto w-full space-y-6 text-center"
      >
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">Document Intake</h2>
          <p className="text-muted-foreground text-body">
            Upload a governance PDF. AI will extract text, suggest metadata, and index for search.
          </p>
        </div>

        {/* Processing indicator */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border bg-card p-6 space-y-3"
          >
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm font-medium text-foreground">Processing document…</p>
              <p className="text-xs text-muted-foreground">AI is extracting text, suggesting metadata, and indexing for search</p>
            </div>
          </motion.div>
        )}

        {/* Drop zone */}
        {!isProcessing && (
          <>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all cursor-pointer ${
                dragActive
                  ? "border-primary bg-accent scale-[1.01]"
                  : file
                  ? "border-primary/40 bg-accent/50"
                  : "border-border hover:border-primary/50 hover:bg-accent/30"
              }`}
              onClick={() => !file && document.getElementById("doc-file-input")?.click()}
            >
              <input
                id="doc-file-input"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileSelect}
              />

              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <FileText className="h-12 w-12 text-primary" />
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-medium text-foreground">{file.name}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  >
                    <X className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-foreground">
                    Drop a PDF here to upload
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Max 50MB • PDF only</p>
                </>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                className="flex-1 h-12"
                onClick={() => document.getElementById("doc-file-input")?.click()}
              >
                <Monitor className="h-4 w-4 mr-2" />
                From Computer
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-12"
                onClick={() => toast.info("Google Drive integration coming soon.")}
              >
                <HardDrive className="h-4 w-4 mr-2" />
                From Google Drive
              </Button>
            </div>

            {file && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                <Button
                  className="w-full h-11"
                  onClick={() => uploadMutation.mutate()}
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? "Uploading…" : "Upload & Process Document"}
                </Button>
              </motion.div>
            )}
          </>
        )}
      </motion.div>

      {/* Document Library */}
      <div>
        <h3 className="text-lg font-semibold tracking-tight mb-4">Document Library</h3>
        <DocumentLibrary onReviewDocument={(id) => { setConfirmDocId(id); setConfirmOpen(true); }} />
      </div>

      {/* Confirm Dialog */}
      <DocumentConfirmDialog
        documentId={confirmDocId}
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
      />
    </div>
  );
}
