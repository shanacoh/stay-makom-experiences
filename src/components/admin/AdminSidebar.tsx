import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Building2,
  Calendar,
  Users,
  UserCircle,
  BookOpen,
  Settings,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, exact: true },
  { title: "Categories", url: "/admin/categories", icon: FolderKanban },
  { title: "Hotels", url: "/admin/hotels", icon: Building2 },
  { title: "Experiences", url: "/admin/experiences", icon: Sparkles },
  { title: "Extras", url: "/admin/extras", icon: ShoppingBag },
  { title: "Bookings", url: "/admin/bookings", icon: Calendar },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Customers", url: "/admin/customers", icon: UserCircle },
  { title: "Journal", url: "/admin/journal", icon: BookOpen },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "px-2" : ""}>
            {!collapsed && "STAYMAKOM Admin"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={
                      isActive(item.url, item.exact)
                        ? "bg-[#D72638] text-white hover:bg-[#D72638]/90"
                        : "hover:bg-muted"
                    }
                  >
                    <Link to={item.url}>
                      <item.icon className={collapsed ? "h-5 w-5" : "h-5 w-5 mr-3"} />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
