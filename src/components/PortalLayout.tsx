import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet, useLocation } from "react-router-dom";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/holdings": "My Holdings & Documents",
  "/company": "Company Info",
  "/ai-assistant": "AI Assistant",
  "/portfolio": "Portfolio Ventures",
  "/buy-shares": "Buy Equity",
  "/profile": "My Profile",
  "/admin": "Admin Dashboard",
  "/admin/documents": "Document Intake",
  "/admin/shareholders": "Shareholder Management",
  "/admin/ownership": "Ownership Register",
  "/admin/valuations": "Valuation Management",
  "/admin/portfolio": "Portfolio Entities",
  "/admin/ai": "AI Assistant",
  "/admin/audit": "Audit & Activity Log",
  "/admin/settings": "Settings & Integrations",
};

export default function PortalLayout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Board Vault";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center justify-between border-b bg-card px-sp-4 sticky top-0 z-30" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground" />
              <h1 className="text-sm font-semibold tracking-tight">{title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  3
                </span>
              </Button>
            </div>
          </header>
          <main className="flex-1 p-sp-6 bg-background overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
