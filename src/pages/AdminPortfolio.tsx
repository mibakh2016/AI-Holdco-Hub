import { useState, KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FolderOpen, Plus, Pencil, Trash2, ExternalLink, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface EntityForm {
  name: string;
  sector: string;
  description: string;
  stake_percent: number;
  status: string;
  website_url: string;
  latest_milestone: string;
}

const emptyForm: EntityForm = {
  name: "",
  sector: "",
  description: "",
  stake_percent: 0,
  status: "active",
  website_url: "",
  latest_milestone: "",
};

export default function AdminPortfolio() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<EntityForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: entities, isLoading } = useQuery({
    queryKey: ["admin-portfolio-entities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio_entities")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error("Name is required");
      const payload = {
        name: form.name.trim(),
        sector: form.sector.trim() || null,
        description: form.description.trim() || null,
        stake_percent: form.stake_percent,
        status: form.status,
        website_url: form.website_url.trim() || null,
        latest_milestone: form.latest_milestone.trim() || null,
      };

      if (editId) {
        const { error } = await supabase
          .from("portfolio_entities")
          .update(payload)
          .eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("portfolio_entities")
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio-entities"] });
      toast.success(editId ? "Entity updated" : "Entity added");
      closeDialog();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("portfolio_entities")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio-entities"] });
      toast.success("Entity deleted");
      setDeleteId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (entity: any) => {
    setEditId(entity.id);
    setForm({
      name: entity.name,
      sector: entity.sector || "",
      description: entity.description || "",
      stake_percent: entity.stake_percent || 0,
      status: entity.status,
      website_url: entity.website_url || "",
      latest_milestone: entity.latest_milestone || "",
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditId(null);
    setForm(emptyForm);
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "active": return "bg-emerald-100 text-emerald-700";
      case "exited": return "bg-muted text-muted-foreground";
      case "pipeline": return "bg-blue-100 text-blue-700";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-8 px-4 py-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Portfolio Entities</h2>
          <p className="text-sm text-black">Manage companies and ventures in the portfolio.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" /> Add Entity
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : !entities?.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 border rounded-xl bg-card">
          <FolderOpen className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-base text-muted-foreground">No portfolio entities yet</p>
          <Button variant="outline" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" /> Add your first entity
          </Button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Stake %</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Latest Milestone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entities.map((entity) => (
                  <TableRow key={entity.id} className="text-black">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{entity.name}</span>
                        {entity.website_url && (
                          <a href={entity.website_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                          </a>
                        )}
                      </div>
                      {entity.description && (
                        <p className="text-xs text-black mt-0.5 line-clamp-1">{entity.description}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      {entity.sector ? (
                        <div className="flex flex-wrap gap-1">
                          {entity.sector.split(",").map((s: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">{s.trim()}</Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-black">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-black">{entity.stake_percent}%</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${statusColor(entity.status)}`}>
                        {entity.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-black max-w-[200px] truncate">
                      {entity.latest_milestone || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(entity)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(entity.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); else setDialogOpen(true); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Entity" : "Add Portfolio Entity"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Company name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sector Tags</Label>
                <div className="flex flex-wrap gap-1.5 min-h-[36px] rounded-lg border border-input bg-card px-2 py-1.5 focus-within:border-input-focus focus-within:shadow-cake-focus transition-all">
                  {form.sector.split(",").filter(Boolean).map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs gap-1 pr-1">
                      {tag.trim()}
                      <button type="button" onClick={() => {
                        const tags = form.sector.split(",").filter(Boolean).map(t => t.trim());
                        tags.splice(i, 1);
                        setForm({ ...form, sector: tags.join(",") });
                      }}><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                  <input
                    className="flex-1 min-w-[100px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    placeholder="Type & press Enter"
                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        const val = e.currentTarget.value.trim();
                        if (val) {
                          const existing = form.sector.split(",").filter(Boolean).map(t => t.trim());
                          if (!existing.includes(val)) {
                            setForm({ ...form, sector: [...existing, val].join(",") });
                          }
                          e.currentTarget.value = "";
                        }
                      }
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Stake %</Label>
                <Input type="number" min={0} max={100} step={0.01} value={form.stake_percent} onChange={(e) => setForm({ ...form, stake_percent: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pipeline">Pipeline</SelectItem>
                  <SelectItem value="exited">Exited</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description of the entity" rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Website URL</Label>
              <Input value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Latest Milestone</Label>
              <Input value={form.latest_milestone} onChange={(e) => setForm({ ...form, latest_milestone: e.target.value })} placeholder="e.g. Series B raised" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {editId ? "Save Changes" : "Add Entity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Entity</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this portfolio entity? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
