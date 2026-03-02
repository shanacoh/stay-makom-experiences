import { Outlet, Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#FAF8F5]">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 sm:h-16 border-b bg-white flex items-center px-3 sm:px-6 sticky top-0 z-10">
            <SidebarTrigger className="h-8 w-8 sm:h-9 sm:w-9" />
            <h1 className="ml-2 sm:ml-4 text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold line-clamp-2 leading-tight">Admin Dashboard</h1>
            <Link to="/" className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
              ← Retour au site
            </Link>
          </header>
          <main className="flex-1 p-3 sm:p-6 overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}