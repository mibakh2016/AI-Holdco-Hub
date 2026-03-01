import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Plus, Search, Pencil, Trash2, MoreHorizontal } from "lucide-react";
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
import { toast } from "sonner";
import ShareholderDialog from "@/components/admin/ShareholderDialog";
import type { Tables } from "@/integrations/supabase/types";

type Shareholder = Tables<"shareholders">;

export default function AdminShareholders() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Shareholder | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Shareholder | null>(null);

  const { data: shareholders = [], isLoading } = useQuery({
    queryKey: ["admin-shareholders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shareholders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Shareholder[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("shareholders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-shareholders"] });
      toast.success("Shareholder deleted");
      setDeleteTarget(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = shareholders.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnits = shareholders.reduce((a, s) => a + s.units, 0);
  const totalOwnership = shareholders.reduce((a, s) => a + Number(s.ownership_percent), 0);
  const activeCount = shareholders.filter((s) => s.status === "active").length;

  return (
    <div className="space-y-6 max-w-6xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">Shareholder Management</h2>
        <p className="text-muted-foreground text-body">View, add, and manage all shareholders.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Shareholders" value={shareholders.length.toString()} icon={Users} delay={0} />
        <StatCard label="Active Shareholders" value={activeCount.toString()} icon={Users} delay={0.04} />
        <StatCard label="Total Ownership" value={`${totalOwnership.toFixed(2)}%`} icon={Users} delay={0.08} />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Shareholder
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
              <TableHead className="text-label">Name</TableHead>
              <TableHead className="text-label">Email</TableHead>
              <TableHead className="text-label text-right">Units</TableHead>
              <TableHead className="text-label text-right">Ownership %</TableHead>
              <TableHead className="text-label">Status</TableHead>
              <TableHead className="text-label">Joined</TableHead>
              <TableHead className="text-label w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><div className="skeleton h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  {search ? "No shareholders match your search." : "No shareholders yet. Add one to get started."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium text-table">{s.full_name}</TableCell>
                  <TableCell className="text-table text-muted-foreground">{s.email}</TableCell>
                  <TableCell className="text-table text-right">{s.units.toLocaleString()}</TableCell>
                  <TableCell className="text-table text-right">{Number(s.ownership_percent).toFixed(2)}%</TableCell>
                  <TableCell>
                    <Badge
                      variant={s.status === "active" ? "default" : "secondary"}
                      className="capitalize text-xs"
                    >
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-table text-muted-foreground">
                    {new Date(s.joined_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditing(s); setDialogOpen(true); }}>
                          <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget(s)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Add/Edit Dialog */}
      <ShareholderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        shareholder={editing}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete shareholder?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <span className="font-medium">{deleteTarget?.full_name}</span> from the register. This action cannot be undone.
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
