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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-[60vh] text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent mb-4">
        <Construction className="h-7 w-7 text-accent-foreground" />
      </div>
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
        This section is ready for backend integration. Connect Lovable Cloud to enable full functionality with database, authentication, and document management.
      </p>
    </motion.div>
  );
}
