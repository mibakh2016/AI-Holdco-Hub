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
  
  TrendingUp,
  Activity,
  Settings,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  { title: "Home", url: "/admin", icon: Shield },
  { title: "Document Intake", url: "/admin/documents", icon: FileUp },
  { title: "Shareholders", url: "/admin/shareholders", icon: Users },
  
  { title: "AI Assistant", url: "/admin/ai", icon: Bot },
  { title: "Portfolio Entities", url: "/admin/portfolio", icon: FolderOpen },
  { title: "Valuations", url: "/admin/valuations", icon: TrendingUp },
  { title: "Audit Log", url: "/admin/audit", icon: Activity },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const displayName = profile?.full_name || user?.email || "User";
  const initials = displayName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-sp-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
            BV
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">Board Vault</span>
              <span className="text-[11px] text-sidebar-muted">Admin Portal</span>
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
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:font-semibold transition-colors rounded-md text-[13px]"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium border-l-[3px] border-primary"
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
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex flex-1 flex-col">
              <span className="text-xs font-medium text-sidebar-foreground">{displayName}</span>
              <span className="text-[11px] text-sidebar-muted">Shareholder</span>
            </div>
          )}
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full rounded-md px-2 py-2 text-orange-500 hover:bg-orange-500/10 transition-colors text-sm font-medium"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
