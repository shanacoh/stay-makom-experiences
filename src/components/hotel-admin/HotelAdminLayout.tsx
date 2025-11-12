import { Outlet, NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Hotel, 
  Ticket, 
  Plus, 
  Package, 
  Calendar, 
  DollarSign,
  FileText,
  CreditCard,
  Star,
  Wallet,
  MessageSquare,
  Settings
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/hotel-admin", icon: LayoutDashboard, end: true },
  { name: "My Property", href: "/hotel-admin/property", icon: Hotel },
  { name: "Experiences", href: "/hotel-admin/experiences", icon: Ticket },
  { name: "Extras", href: "/hotel-admin/extras", icon: Plus },
  { name: "Packages", href: "/hotel-admin/packages", icon: Package },
  { name: "Calendar", href: "/hotel-admin/calendar", icon: Calendar },
  { name: "Pricing", href: "/hotel-admin/pricing", icon: DollarSign },
  { name: "Bookings", href: "/hotel-admin/bookings", icon: FileText },
  { name: "Billing", href: "/hotel-admin/billing", icon: CreditCard },
  { name: "Reviews", href: "/hotel-admin/reviews", icon: Star },
  { name: "Payments", href: "/hotel-admin/payments", icon: Wallet },
  { name: "Contact & Support", href: "/hotel-admin/contact", icon: MessageSquare },
  { name: "Settings", href: "/hotel-admin/settings", icon: Settings },
];

export const HotelAdminLayout = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="sticky top-0 flex h-full flex-col">
          <div className="p-6 border-b">
            <h2 className="font-serif text-2xl font-bold">Hotel Admin</h2>
          </div>
          
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = item.end 
                ? location.pathname === item.href
                : location.pathname.startsWith(item.href);
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
