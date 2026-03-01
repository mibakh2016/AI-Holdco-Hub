import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, X, HardDrive, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminDocuments() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

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

      const path = `${crypto.randomUUID()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);

      const { error } = await supabase.from("documents").insert([{
        title: file.name.replace(/\.pdf$/i, ""),
        document_type: "general",
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_size: file.size,
        status: "pending",
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
      toast.success("Document uploaded — pending review");
      setFile(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] max-w-xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-6 text-center"
      >
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">Document Intake</h2>
          <p className="text-muted-foreground text-body">
            Upload a governance PDF from your computer or Google Drive.
          </p>
        </div>

        {/* Drop zone */}
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
              <p className="text-xs text-muted-foreground mt-1">or choose a source below</p>
            </>
          )}
        </div>

        {/* Source buttons */}
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
            onClick={() => toast.info("Google Drive integration coming soon. Connect in Settings → Integrations.")}
          >
            <HardDrive className="h-4 w-4 mr-2" />
            From Google Drive
          </Button>
        </div>

        {/* Upload action */}
        {file && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
            <Button
              className="w-full h-11"
              onClick={() => uploadMutation.mutate()}
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? "Uploading…" : "Upload Document"}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
