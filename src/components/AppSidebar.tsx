import {
  LayoutDashboard,
  Briefcase,
  Building2,
  Bot,
  ShoppingCart,
  FolderOpen,
  User,
  Shield,
  FileUp,
  Users,
  BookOpen,
  TrendingUp,
  Activity,
  Settings,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const shareholderNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Holdings", url: "/holdings", icon: Briefcase },
  { title: "Company Info", url: "/company", icon: Building2 },
  { title: "AI Assistant", url: "/ai-assistant", icon: Bot },
  { title: "Portfolio Ventures", url: "/portfolio", icon: FolderOpen },
  { title: "Buy Equity", url: "/buy-shares", icon: ShoppingCart },
  { title: "My Profile", url: "/profile", icon: User },
];

const adminNav = [
  { title: "Admin Dashboard", url: "/admin", icon: Shield },
  { title: "Document Intake", url: "/admin/documents", icon: FileUp },
  { title: "Shareholders", url: "/admin/shareholders", icon: Users },
  { title: "Ownership Register", url: "/admin/ownership", icon: BookOpen },
  { title: "Valuations", url: "/admin/valuations", icon: TrendingUp },
  { title: "Portfolio Entities", url: "/admin/portfolio", icon: FolderOpen },
  { title: "AI Assistant", url: "/admin/ai", icon: Bot },
  { title: "Audit Log", url: "/admin/audit", icon: Activity },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-sp-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
            BV
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">Board Vault</span>
              <span className="text-[11px] text-sidebar-muted">Governance Portal</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-[11px] uppercase tracking-wider font-medium">
            {isAdmin ? "Administration" : "Investor Portal"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {(isAdmin ? adminNav : shareholderNav).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard" || item.url === "/admin"}
                      className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors rounded-md text-[13px]"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to={isAdmin ? "/dashboard" : "/admin"}
                    className="text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors rounded-md text-[13px]"
                    activeClassName=""
                  >
                    {isAdmin ? <LayoutDashboard className="mr-2 h-4 w-4 shrink-0" /> : <Shield className="mr-2 h-4 w-4 shrink-0" />}
                    {!collapsed && <span className="text-xs">{isAdmin ? "Switch to Investor" : "Switch to Admin"}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-2">
        <div className="flex items-center gap-3 rounded-md bg-sidebar-accent/60 p-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sidebar-primary text-[11px] font-bold text-sidebar-primary-foreground">
            MC
          </div>
          {!collapsed && (
            <div className="flex flex-1 flex-col">
              <span className="text-xs font-medium text-sidebar-foreground">Maria Chen</span>
              <span className="text-[11px] text-sidebar-muted">Shareholder</span>
            </div>
          )}
        </div>
        <button className="flex items-center gap-2 w-full rounded-md px-2 py-2 text-orange-500 hover:bg-orange-500/10 transition-colors text-sm font-medium">
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
