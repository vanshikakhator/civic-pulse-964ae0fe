import { useAuth } from "@/hooks/useAuth";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Shield, LayoutDashboard, FileText, PlusCircle, BarChart3, MapPin, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const { isAdmin, signOut, user } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const userItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "New Complaint", url: "/complaints/new", icon: PlusCircle },
    { title: "My Complaints", url: "/complaints", icon: FileText },
  ];

  const adminItems = [
    { title: "Admin Dashboard", url: "/admin", icon: BarChart3 },
    { title: "All Complaints", url: "/admin/complaints", icon: FileText },
    { title: "Hotspot Areas", url: "/admin/hotspots", icon: MapPin },
    { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  ];

  return (
    <Sidebar className="border-r-0" collapsible="icon">
      <div className="p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg gradient-accent flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-accent-foreground" />
        </div>
        {!collapsed && (
          <div className="animate-slide-in">
            <h2 className="font-display font-bold text-sm text-sidebar-foreground">SmartGov</h2>
            <p className="text-[10px] text-sidebar-foreground/60">Civic Intelligence</p>
          </div>
        )}
      </div>

      <SidebarContent>
        {isAdmin ? (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-[10px] tracking-wider">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className="hover:bg-sidebar-accent/60 transition-colors"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-[10px] tracking-wider">
              Citizen
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {userItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className="hover:bg-sidebar-accent/60 transition-colors"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && (
          <div className="text-xs text-sidebar-foreground/50 mb-2 truncate">
            {user?.email}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {!collapsed && "Sign Out"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
