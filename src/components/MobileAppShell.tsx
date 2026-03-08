/**
 * Global mobile shell — wraps any page with:
 * - MobileStickyHeader (top)
 * - MobileBottomNav (bottom)
 * Only renders on mobile (md:hidden handled inside children).
 */
import MobileStickyHeader from "@/components/MobileStickyHeader";
import MobileBottomNav from "@/components/MobileBottomNav";

const MobileAppShell = () => {
  return (
    <>
      <MobileStickyHeader />
      <MobileBottomNav />
    </>
  );
};

export default MobileAppShell;
