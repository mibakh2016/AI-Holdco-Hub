import { motion } from "framer-motion";
import { Construction } from "lucide-react";
import { useLocation } from "react-router-dom";

const titles: Record<string, string> = {
  "/admin/documents": "Document Intake",
  "/admin/shareholders": "Shareholder Management",
  "/admin/ownership": "Ownership Register",
  "/admin/valuations": "Valuation Management",
  "/admin/portfolio": "Portfolio Entities",
  "/admin/ai": "AI Assistant (Admin)",
  "/admin/audit": "Audit & Activity Log",
  "/admin/settings": "Settings & Integrations",
};

export default function AdminPlaceholder() {
  const location = useLocation();
  const title = titles[location.pathname] || "Admin Page";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-[60vh] text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
        <Construction className="h-8 w-8 text-primary" />
      </div>
      <h2 className="font-display text-xl font-bold mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        This section is ready for backend integration. Connect Lovable Cloud to enable full functionality with database, authentication, and document management.
      </p>
    </motion.div>
  );
}
