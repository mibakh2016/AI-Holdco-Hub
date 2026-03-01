import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Upload, FileText, X, CheckCircle2, Clock, Trash2, Eye, MoreHorizontal, FileUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
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
];

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "Pending Review", variant: "secondary" },
  reviewed: { label: "Reviewed", variant: "outline" },
  published: { label: "Indexed", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
};

const TYPE_LABELS: Record<string, string> = Object.fromEntries(DOCUMENT_TYPES.map((t) => [t.value, t.label]));

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  document_type: z.string().min(1, "Document type is required"),
  linked_shareholder_id: z.string().optional(),
  linked_entity_id: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function AdminDocuments() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);

  // Fetch documents
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["admin-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Document[];
    },
  });

  // Fetch shareholders & entities for linking
  const { data: shareholders = [] } = useQuery({
    queryKey: ["shareholders-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("shareholders").select("id, full_name").order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: entities = [] } = useQuery({
    queryKey: ["entities-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("portfolio_entities").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      document_type: "general",
      linked_shareholder_id: "",
      linked_entity_id: "",
    },
  });

  // Drag & drop handlers
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
      if (!form.getValues("title")) form.setValue("title", dropped.name.replace(/\.pdf$/i, ""));
    } else {
      toast.error("Only PDF files are accepted");
    }
  }, [form]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected?.type === "application/pdf") {
      setFile(selected);
      if (!form.getValues("title")) form.setValue("title", selected.name.replace(/\.pdf$/i, ""));
    } else if (selected) {
      toast.error("Only PDF files are accepted");
    }
  };

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!file) throw new Error("Please select a PDF file");

      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);

      const { error } = await supabase.from("documents").insert([{
        title: values.title,
        description: values.description || null,
        document_type: values.document_type,
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
      form.reset();
      setFile(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
      toast.success("Document deleted");
      setDeleteTarget(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("documents").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
      toast.success("Status updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-8 max-w-4xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">Document Intake</h2>
        <p className="text-muted-foreground text-body">
          Upload and categorize governance documents.
        </p>
      </motion.div>

      {/* Upload Form — always visible */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="glass-card rounded-lg p-6"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => uploadMutation.mutate(v))} className="space-y-5">
            {/* Drop zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById("doc-file-input")?.click()}
              className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer ${
                dragActive
                  ? "border-primary bg-accent"
                  : file
                  ? "border-primary/40 bg-accent/50"
                  : "border-border hover:border-primary/50 hover:bg-accent/30"
              }`}
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
                  <FileText className="h-9 w-9 text-primary" />
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
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-9 w-9 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium text-foreground">Drop PDF here or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF files only</p>
                </>
              )}
            </div>

            {/* Fields */}
            <div className="grid gap-4 sm:grid-cols-2">
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
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} placeholder="Brief description…" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
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

            <div className="flex justify-end pt-1">
              <Button type="submit" disabled={uploadMutation.isPending || !file}>
                <FileUp className="h-4 w-4 mr-1.5" />
                {uploadMutation.isPending ? "Uploading…" : "Upload & Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </motion.div>

      {/* Recent uploads */}
      {documents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-semibold text-foreground">Recent Uploads</h3>
          <div className="glass-card rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-label">Title</TableHead>
                  <TableHead className="text-label">Type</TableHead>
                  <TableHead className="text-label">Status</TableHead>
                  <TableHead className="text-label">Date</TableHead>
                  <TableHead className="text-label w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((d) => {
                  const statusInfo = STATUS_MAP[d.status] || STATUS_MAP.pending;
                  return (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium text-table max-w-[220px] truncate">
                        {d.title}
                      </TableCell>
                      <TableCell className="text-table">
                        {TYPE_LABELS[d.document_type] || d.document_type}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant} className="text-xs">
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-table">
                        {new Date(d.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {d.file_url && (
                              <DropdownMenuItem onClick={() => window.open(d.file_url!, "_blank")}>
                                <Eye className="h-3.5 w-3.5 mr-2" /> View PDF
                              </DropdownMenuItem>
                            )}
                            {d.status === "pending" && (
                              <DropdownMenuItem
                                onClick={() => updateStatusMutation.mutate({ id: d.id, status: "published" })}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Mark as Indexed
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteTarget(d)}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <span className="font-medium">{deleteTarget?.title}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
