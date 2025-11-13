import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Category from "./pages/Category";
import Experience from "./pages/Experience";
import Hotel from "./pages/Hotel";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import Admin from "./pages/Admin";
import GiftCard from "./pages/GiftCard";
import GiftCardConfirmation from "./pages/GiftCardConfirmation";
import Companies from "./pages/Companies";
import { HotelAdminLayout } from "@/components/hotel-admin/HotelAdminLayout";
import HotelAdminDashboard from "./pages/hotel-admin/Dashboard";
import HotelProperty from "./pages/hotel-admin/Property";
import HotelExperiences from "./pages/hotel-admin/Experiences";
import HotelExtras from "./pages/hotel-admin/Extras";
import HotelPackages from "./pages/hotel-admin/Packages";
import HotelCalendar from "./pages/hotel-admin/Calendar";
import HotelPricing from "./pages/hotel-admin/Pricing";
import HotelBookings from "./pages/hotel-admin/Bookings";
import HotelBilling from "./pages/hotel-admin/Billing";
import HotelReviews from "./pages/hotel-admin/Reviews";
import HotelPayments from "./pages/hotel-admin/Payments";
import HotelContact from "./pages/hotel-admin/Contact";
import HotelSettings from "./pages/hotel-admin/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/gift-card" element={<GiftCard />} />
            <Route path="/gift-card/confirmation" element={<GiftCardConfirmation />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/corporate" element={<Companies />} />
            <Route path="/category/:slug" element={<Category />} />
            <Route path="/experience/:slug" element={<Experience />} />
            <Route path="/hotel/:slug" element={<Hotel />} />
            <Route path="/hotels/:slug" element={<Hotel />} />
            <Route
              path="/account"
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <Account />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hotel-admin"
              element={
                <ProtectedRoute allowedRoles={["hotel_admin"]}>
                  <HotelAdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<HotelAdminDashboard />} />
              <Route path="property" element={<HotelProperty />} />
              <Route path="experiences" element={<HotelExperiences />} />
              <Route path="extras" element={<HotelExtras />} />
              <Route path="packages" element={<HotelPackages />} />
              <Route path="calendar" element={<HotelCalendar />} />
              <Route path="pricing" element={<HotelPricing />} />
            <Route path="bookings" element={<HotelBookings />} />
            <Route path="billing" element={<HotelBilling />} />
            <Route path="reviews" element={<HotelReviews />} />
            <Route path="payments" element={<HotelPayments />} />
            <Route path="contact" element={<HotelContact />} />
            <Route path="settings" element={<HotelSettings />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;