import { motion } from "framer-motion";
import { currentUser } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

export default function Profile() {
  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground font-display">
            {currentUser.avatarInitials}
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">{currentUser.name}</h3>
            <p className="text-sm text-muted-foreground capitalize">{currentUser.role}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input defaultValue={currentUser.name} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input defaultValue={currentUser.email} type="email" />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input defaultValue="+1 (555) 123-4567" />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input defaultValue="San Francisco, CA" />
          </div>
        </div>

        <Button className="gap-2">
          <Save className="h-4 w-4" /> Save Changes
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-xl p-6 space-y-4">
        <h3 className="font-display font-semibold">Change Password</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
        </div>
        <Button variant="outline" className="gap-2">Update Password</Button>
      </motion.div>
    </div>
  );
}
