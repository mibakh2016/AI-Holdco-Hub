import { motion } from "framer-motion";
import { currentUser } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Camera } from "lucide-react";
import { useRef, useState } from "react";

export default function Profile() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  return (
    <div className="space-y-sp-4 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-lg p-sp-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative group">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-14 w-14 rounded-full object-cover" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                {currentUser.avatarInitials}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="h-5 w-5 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{currentUser.name}</h3>
            <p className="text-sm text-muted-foreground capitalize">{currentUser.role}</p>
          </div>
        </div>

        <div className="grid gap-sp-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-label">Full Name</Label>
            <Input defaultValue={currentUser.name} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-label">Email</Label>
            <Input defaultValue={currentUser.email} type="email" disabled className="opacity-60" />
            <p className="text-xs text-muted-foreground">Only an admin can change your email</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-label">Phone</Label>
            <Input defaultValue="+1 (555) 123-4567" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-label">Mail Address</Label>
            <Input defaultValue="123 Market St, San Francisco, CA 94105" />
          </div>
        </div>

        <Button className="gap-2">
          <Save className="h-4 w-4" /> Save Changes
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} className="glass-card rounded-lg p-sp-6 space-y-4">
        <h3 className="font-semibold">Change Password</h3>
        <div className="grid gap-sp-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-label">Current Password</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-label">New Password</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
        </div>
        <Button variant="outline" className="gap-2">Update Password</Button>
      </motion.div>
    </div>
  );
}
