import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2, ChevronLeft } from "lucide-react";
import WishlistSection from "@/components/account/WishlistSection";
import MyStaymakomSection from "@/components/account/MyStaymakomSection";
import MyAccountSection from "@/components/account/MyAccountSection";
import AccountHeader from "@/components/account/AccountHeader";
import RecommendedExperiences from "@/components/account/RecommendedExperiences";
import RecommendedJournal from "@/components/account/RecommendedJournal";
import PersonalizedRequestSection from "@/components/account/PersonalizedRequestSection";
import GiftCardsSection from "@/components/account/GiftCardsSection";
import AccountSidebar from "@/components/account/AccountSidebar";
import OnboardingFlow from "@/components/auth/OnboardingFlow";
import MobileAccountHome from "@/components/account/MobileAccountHome";
import { useIsMobile } from "@/hooks/use-mobile";

const MOBILE_TAB_TITLES: Record<string, string> = {
  bookings: "My Bookings",
  wishlist: "Saved Escapes",
  giftcards: "Gift Cards",
  profile: "Personal Information",
};

const Account = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const isMobile = useIsMobile();
  
  const [activeTab, setActiveTab] = useState(tabFromUrl || "bookings");
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (tabFromUrl && ["wishlist", "bookings", "giftcards", "profile"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["user-profile-onboarding", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("user_profiles")
        .select("onboarding_completed_at, display_name")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (profile && !profile.onboarding_completed_at && !profile.display_name) {
      setShowOnboarding(true);
    }
  }, [profile]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  // === MOBILE LAYOUT ===
  if (isMobile) {
    // No tab param = show profile hub
    if (!tabFromUrl) {
      return (
        <>
          <MobileAccountHome />
          {user && (
            <OnboardingFlow
              open={showOnboarding}
              onComplete={() => setShowOnboarding(false)}
              userId={user.id}
            />
          )}
        </>
      );
    }

    // Tab param = show that section full-screen
    const pageTitle = MOBILE_TAB_TITLES[tabFromUrl] || "Account";

    return (
      <div className="min-h-screen pb-24">
        {/* Mobile sub-page header */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border/50 md:hidden">
          <div className="flex items-center h-14 px-2">
            <button
              onClick={() => navigate("/account")}
              className="flex items-center justify-center w-11 h-11"
              aria-label="Back"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <h1 className="absolute left-1/2 -translate-x-1/2 text-[15px] font-semibold text-foreground">
              {pageTitle}
            </h1>
          </div>
        </div>

        <div className="pt-16 px-4">
          {tabFromUrl === "bookings" && <MyStaymakomSection userId={user.id} />}
          {tabFromUrl === "wishlist" && <WishlistSection userId={user.id} />}
          {tabFromUrl === "giftcards" && (
            <GiftCardsSection userId={user.id} userEmail={user.email} />
          )}
          {tabFromUrl === "profile" && (
            <MyAccountSection userId={user.id} userEmail={user.email} mobile />
          )}
        </div>
      </div>
    );
  }

  // === DESKTOP LAYOUT (unchanged) ===
  const renderContent = () => {
    switch (activeTab) {
      case "wishlist":
        return (
          <>
            <WishlistSection userId={user.id} />
            <RecommendedExperiences
              userId={user.id}
              title="You might also like"
              subtitle="Based on your favorites and interests"
              compact
              limit={4}
            />
            <PersonalizedRequestSection
              userName={profile?.display_name || undefined}
              userEmail={user.email}
            />
          </>
        );
      case "bookings":
        return (
          <>
            <MyStaymakomSection userId={user.id} />
            <RecommendedExperiences
              userId={user.id}
              title="Your next adventure awaits"
              subtitle="Discover more extraordinary experiences"
              compact
              limit={4}
            />
            <PersonalizedRequestSection
              userName={profile?.display_name || undefined}
              userEmail={user.email}
            />
          </>
        );
      case "giftcards":
        return (
          <>
            <GiftCardsSection userId={user.id} userEmail={user.email} />
            <PersonalizedRequestSection
              userName={profile?.display_name || undefined}
              userEmail={user.email}
            />
          </>
        );
      case "profile":
        return (
          <>
            <MyAccountSection userId={user.id} userEmail={user.email} />
            <PersonalizedRequestSection
              userName={profile?.display_name || undefined}
              userEmail={user.email}
            />
            <RecommendedJournal userId={user.id} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container pt-24 pb-16">
        <AccountHeader userId={user.id} userEmail={user.email} />
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="hidden md:block w-64 flex-shrink-0">
            <AccountSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          </aside>
          <div className="flex-1 min-w-0">{renderContent()}</div>
        </div>
      </main>
      <Footer />
      {user && (
        <OnboardingFlow
          open={showOnboarding}
          onComplete={() => setShowOnboarding(false)}
          userId={user.id}
        />
      )}
    </div>
  );
};

export default Account;
