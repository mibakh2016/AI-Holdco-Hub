import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Search, Download, Trash2, FileText, ClipboardCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const CATEGORY_LABELS: Record<string, string> = {
  subscription_agreement: "Subscription Agreement",
  board_resolution: "Board Resolution",
  financial_report: "Financial Report",
  shareholder_agreement: "Shareholder Agreement",
  bylaws: "Bylaws",
  operating_agreement: "Operating Agreement",
  annual_report: "Annual Report",
  tax_document: "Tax Document",
  meeting_minutes: "Meeting Minutes",
  general: "General",
};

function formatFileSize(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

interface DocumentLibraryProps {
  onReviewDocument?: (id: string) => void;
}

export default function DocumentLibrary({ onReviewDocument }: DocumentLibraryProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: documents, isLoading } = useQuery({
    queryKey: ["admin-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, fileUrl }: { id: string; fileUrl: string | null }) => {
      // Delete from storage if we have a file URL
      if (fileUrl) {
        const path = fileUrl.split("/documents/")[1];
        if (path) {
          await supabase.storage.from("documents").remove([decodeURIComponent(path)]);
        }
      }
      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
      toast.success("Document deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = (documents ?? []).filter((doc) => {
    const matchesSearch = !search || doc.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || doc.document_type === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground">
            {documents?.length === 0 ? "No documents yet" : "No documents match your filters"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {documents?.length === 0
              ? "Upload your first document above"
              : "Try adjusting your search or category filter"}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="hidden sm:table-cell">Size</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {doc.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" className="text-xs">
                      {CATEGORY_LABELS[doc.document_type] || doc.document_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-xs">
                    {formatFileSize(doc.file_size)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge
                      variant={doc.status === "published" ? "success" : doc.status === "pending" ? "warning" : "outline"}
                      className="text-xs"
                    >
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                    {format(new Date(doc.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {doc.status === "pending" && onReviewDocument && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => onReviewDocument(doc.id)}
                        >
                          <ClipboardCheck className="h-3 w-3 mr-1" /> Review
                        </Button>
                      )}
                      {doc.file_url && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete document?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{doc.title}" and its file. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate({ id: doc.id, fileUrl: doc.file_url })}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
