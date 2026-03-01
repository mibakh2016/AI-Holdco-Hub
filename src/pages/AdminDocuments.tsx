import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  FileText, Plus, Search, MoreHorizontal, Trash2, Pencil, Eye,
  FileUp, CheckCircle2, Clock,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import DocumentUploadDialog from "@/components/admin/DocumentUploadDialog";
import type { Tables } from "@/integrations/supabase/types";

type Document = Tables<"documents">;

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "Pending Review", variant: "secondary" },
  reviewed: { label: "Reviewed", variant: "outline" },
  published: { label: "Indexed", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
};

const TYPE_LABELS: Record<string, string> = {
  subscription_agreement: "Subscription Agreement",
  investment_agreement: "Investment Agreement",
  shareholder_agreement: "Shareholder Agreement",
  board_resolution: "Board Resolution",
  valuation_report: "Valuation Report",
  ppm: "PPM",
  sec_filing: "SEC Filing",
  side_letter: "Side Letter",
  general: "General",
};

export default function AdminDocuments() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);

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
      const { error } = await supabase
        .from("documents")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
      toast.success("Document status updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = documents.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      (d.file_name || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalDocs = documents.length;
  const pendingCount = documents.filter((d) => d.status === "pending").length;
  const indexedCount = documents.filter((d) => d.status === "published").length;

  return (
    <div className="space-y-6 max-w-6xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">Document Intake</h2>
        <p className="text-muted-foreground text-body">
          Upload, categorize, and manage governance documents.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Documents" value={totalDocs.toString()} icon={FileText} delay={0} />
        <StatCard label="Pending Review" value={pendingCount.toString()} icon={Clock} delay={0.04} />
        <StatCard label="Indexed" value={indexedCount.toString()} icon={CheckCircle2} delay={0.08} />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending Review</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="published">Indexed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Upload Document
        </Button>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="glass-card rounded-lg overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-label">Title</TableHead>
              <TableHead className="text-label">Type</TableHead>
              <TableHead className="text-label">File</TableHead>
              <TableHead className="text-label">Status</TableHead>
              <TableHead className="text-label">Uploaded</TableHead>
              <TableHead className="text-label w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><div className="skeleton h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  {search || statusFilter !== "all"
                    ? "No documents match your filters."
                    : "No documents yet. Upload one to get started."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((d) => {
                const statusInfo = STATUS_MAP[d.status] || STATUS_MAP.pending;
                return (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium text-table max-w-[250px] truncate">
                      {d.title}
                    </TableCell>
                    <TableCell className="text-table">
                      {TYPE_LABELS[d.document_type] || d.document_type}
                    </TableCell>
                    <TableCell className="text-table">
                      {d.file_name ? (
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <FileUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[140px]">{d.file_name}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">No file</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant} className="capitalize text-xs">
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
              })
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Upload Dialog */}
      <DocumentUploadDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <span className="font-medium">{deleteTarget?.title}</span>. This action cannot be undone.
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
