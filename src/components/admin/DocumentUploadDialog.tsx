import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, FileText, X } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Document = Tables<"documents">;

const DOCUMENT_TYPES = [
  { value: "subscription_agreement", label: "Subscription Agreement" },
  { value: "investment_agreement", label: "Investment Agreement" },
  { value: "shareholder_agreement", label: "Shareholder Agreement" },
  { value: "board_resolution", label: "Board Resolution" },
  { value: "valuation_report", label: "Valuation Report" },
  { value: "ppm", label: "Private Placement Memorandum" },
  { value: "sec_filing", label: "SEC Filing" },
  { value: "side_letter", label: "Side Letter" },
  { value: "general", label: "General / Other" },
] as const;

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  document_type: z.string().min(1, "Document type is required"),
  linked_shareholder_id: z.string().optional(),
  linked_entity_id: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingDocument?: Document | null;
}

export default function DocumentUploadDialog({ open, onOpenChange, editingDocument }: Props) {
  const queryClient = useQueryClient();
  const isEditing = !!editingDocument;
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const { data: shareholders = [] } = useQuery({
    queryKey: ["shareholders-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shareholders")
        .select("id, full_name")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: entities = [] } = useQuery({
    queryKey: ["entities-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio_entities")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: editingDocument?.title || "",
      description: editingDocument?.description || "",
      document_type: editingDocument?.document_type || "general",
      linked_shareholder_id: "",
      linked_entity_id: "",
    },
  });

  // Reset form when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset({
        title: "",
        description: "",
        document_type: "general",
        linked_shareholder_id: "",
        linked_entity_id: "",
      });
      setFile(null);
    }
    onOpenChange(isOpen);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (dropped.type === "application/pdf") {
        setFile(dropped);
        if (!form.getValues("title")) {
          form.setValue("title", dropped.name.replace(/\.pdf$/i, ""));
        }
      } else {
        toast.error("Only PDF files are accepted");
      }
    }
  }, [form]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type === "application/pdf") {
        setFile(selected);
        if (!form.getValues("title")) {
          form.setValue("title", selected.name.replace(/\.pdf$/i, ""));
        }
      } else {
        toast.error("Only PDF files are accepted");
      }
    }
  };

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      let fileUrl: string | null = editingDocument?.file_url || null;
      let fileName: string | null = editingDocument?.file_name || null;
      let fileSize: number | null = editingDocument?.file_size || null;

      // Upload file to storage if new file selected
      if (file) {
        const ext = file.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(path, file, { contentType: file.type });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("documents")
          .getPublicUrl(path);
        fileUrl = urlData.publicUrl;
        fileName = file.name;
        fileSize = file.size;
      }

      const payload = {
        title: values.title,
        description: values.description || null,
        document_type: values.document_type,
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize,
        status: "pending" as const,
      };

      if (isEditing && editingDocument) {
        const { error } = await supabase
          .from("documents")
          .update(payload)
          .eq("id", editingDocument.id);
        if (error) throw error;
      } else {
        if (!file) throw new Error("Please select a PDF file to upload");
        const { error } = await supabase.from("documents").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
      toast.success(isEditing ? "Document updated" : "Document uploaded — pending review");
      handleOpenChange(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Document" : "Upload Document"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            {/* Drop zone */}
            {!isEditing && (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer ${
                  dragActive
                    ? "border-primary bg-accent"
                    : file
                    ? "border-primary/40 bg-accent/50"
                    : "border-border hover:border-primary/50 hover:bg-accent/30"
                }`}
                onClick={() => document.getElementById("doc-file-input")?.click()}
              >
                <input
                  id="doc-file-input"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                {file ? (
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium text-foreground">
                      Drop PDF here or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">PDF files only</p>
                  </>
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Title</FormLabel>
                  <FormControl><Input {...field} placeholder="e.g. Subscription Agreement — Series A" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="document_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} placeholder="Brief description of the document…" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="linked_shareholder_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link to Shareholder</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {shareholders.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="linked_entity_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link to Entity</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {entities.map((e) => (
                          <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Uploading…" : isEditing ? "Update" : "Upload & Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
