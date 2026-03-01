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
  ChevronDown,
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
  { title: "Company Overview", url: "/company", icon: Building2 },
  { title: "AI Assistant", url: "/ai-assistant", icon: Bot },
  { title: "Portfolio Ventures", url: "/portfolio", icon: FolderOpen },
  { title: "Buy Share Units", url: "/buy-shares", icon: ShoppingCart },
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
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary font-display text-sm font-bold text-sidebar-primary-foreground">
            BV
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-display text-sm font-semibold text-sidebar-foreground">Board Vault</span>
              <span className="text-xs text-sidebar-muted">Governance Portal</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-[11px] uppercase tracking-wider">
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
                      className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
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

        {!isAdmin && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/admin"
                      className="text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                      activeClassName=""
                    >
                      <Shield className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span className="text-xs">Switch to Admin</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/dashboard"
                      className="text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                      activeClassName=""
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span className="text-xs">Switch to Investor</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
            MC
          </div>
          {!collapsed && (
            <div className="flex flex-1 flex-col">
              <span className="text-xs font-medium text-sidebar-foreground">Maria Chen</span>
              <span className="text-[11px] text-sidebar-muted">Shareholder</span>
            </div>
          )}
          {!collapsed && <LogOut className="h-4 w-4 text-sidebar-muted cursor-pointer hover:text-sidebar-foreground transition-colors" />}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
