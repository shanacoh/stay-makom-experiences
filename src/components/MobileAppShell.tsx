/**
 * Global mobile shell — wraps any page with:
 * - MobileStickyHeader (top)
 * - MobileBottomNav (bottom)
 * Hidden on admin/hotel-admin routes.
 */
import { useLocation } from "react-router-dom";
import MobileStickyHeader from "@/components/MobileStickyHeader";
import MobileBottomNav from "@/components/MobileBottomNav";

const MobileAppShell = () => {
  const location = useLocation();
  
  // Don't show on admin routes
  const isAdmin = location.pathname.startsWith("/admin") || location.pathname.startsWith("/hotel-admin");
  if (isAdmin) return null;

  return (
    <>
      <MobileStickyHeader />
      <MobileBottomNav />
    </>
  );
};

export default MobileAppShell;
