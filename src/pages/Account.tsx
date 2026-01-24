import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Calendar, User, Gift, Loader2 } from "lucide-react";
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

const Account = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  
  const [activeTab, setActiveTab] = useState("wishlist");
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Sync tab with URL query param
  useEffect(() => {
    if (tabFromUrl && ["wishlist", "bookings", "giftcards", "profile"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Check if onboarding is needed and get user profile
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

  // Show onboarding if not completed and user just signed up
  useEffect(() => {
    if (profile && !profile.onboarding_completed_at && !profile.display_name) {
      setShowOnboarding(true);
    }
  }, [profile]);

  // Redirect to auth if not logged in
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

  if (!user) {
    return null;
  }

  // Render the active section content
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
        {/* Account Header with Welcome & Points */}
        <AccountHeader userId={user.id} userEmail={user.email} />

        {/* Desktop Layout with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - hidden on mobile */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <AccountSidebar 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
            />
          </aside>

          {/* Mobile Tabs - visible on mobile only */}
          <div className="lg:hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6 p-1 bg-muted/60 rounded-full h-12">
                <TabsTrigger 
                  value="wishlist" 
                  className="flex items-center gap-2 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                >
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline">Wishlist</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="bookings" 
                  className="flex items-center gap-2 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Bookings</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="giftcards" 
                  className="flex items-center gap-2 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                >
                  <Gift className="h-4 w-4" />
                  <span className="hidden sm:inline">Gift Cards</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="profile" 
                  className="flex items-center gap-2 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Account</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {renderContent()}
          </div>
        </div>
      </main>

      <Footer />

      {/* Onboarding Flow for new users */}
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
