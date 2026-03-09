import { safeTrack, safeIdentify, isAmplitudeReady } from "./amplitude";
import * as amplitude from "@amplitude/analytics-browser";

// ============================================
// A. ACQUISITION & IDENTITÉ
// ============================================

export function trackPageViewed(pageName: string, properties?: Record<string, any>) {
  safeTrack("page_viewed", { page: pageName, url: window.location.pathname, ...properties });
}

export function trackUserIdentified(
  userId: string,
  properties: {
    language: string;
    country?: string;
    deviceType: "mobile" | "tablet" | "desktop";
    isReturning: boolean;
  }
) {
  safeIdentify(userId, properties);
}

export function trackUtmCaptured(params: {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
}) {
  safeTrack("utm_captured", params);
}

// ============================================
// B. DISCOVERY (PAGE /launch)
// ============================================

export function trackFindEscapeClicked() {
  safeTrack("find_escape_clicked");
}

export function trackScrollDepth(page: string, depth: 25 | 50 | 75 | 100) {
  safeTrack("scroll_depth", { page, depth_percent: depth });
}

export function trackVibeTabClicked(vibeName: string) {
  safeTrack("vibe_tab_clicked", { vibe: vibeName });
}

export function trackExperienceCardClicked(slug: string, title: string, price: number, index: number) {
  safeTrack("experience_card_clicked", { slug, title, price, position_index: index });
}

export function trackCategoryViewed(categoryName: string) {
  safeTrack("category_viewed", { category: categoryName });
}

export function trackWaitlistSignup(emailDomain: string) {
  safeTrack("waitlist_signup", { email_domain: emailDomain });
}

export function trackGiftCardClicked() {
  safeTrack("gift_card_clicked", { source: "launch_page" });
}

// ============================================
// C. PAGE EXPÉRIENCE (/experience/[slug])
// ============================================

export function trackExperiencePageViewed(slug: string, title: string, price: number) {
  safeTrack("experience_page_viewed", { slug, title, price });
}

export function trackTimeOnExperiencePage(slug: string, durationSeconds: number) {
  if (durationSeconds > 5) {
    safeTrack("time_on_experience_page", { slug, duration_seconds: Math.round(durationSeconds) });
  }
}

export function trackGalleryOpened(slug: string) {
  safeTrack("gallery_opened", { slug });
}

export function trackExperienceShared(slug: string, method: "copy_link" | "whatsapp" | "email" | "native") {
  safeTrack("experience_shared", { slug, method });
}

export function trackWishlistToggled(slug: string, action: "added" | "removed") {
  safeTrack("wishlist_toggled", { slug, action });
}

export function trackAddonViewed(slug: string, addonName: string) {
  safeTrack("addon_viewed", { experience_slug: slug, addon: addonName });
}

export function trackAddonClicked(slug: string, addonName: string, price: number) {
  safeTrack("addon_clicked", { experience_slug: slug, addon: addonName, price });
}

export function trackDateSelected(slug: string, checkIn: string, nights: number) {
  safeTrack("date_selected", { slug, check_in: checkIn, nights });
}

export function trackGuestsSelected(slug: string, adults: number, children: number) {
  safeTrack("guests_selected", { slug, adults, children });
}

export function trackRoomSelected(slug: string, roomName: string, price: number) {
  safeTrack("room_selected", { slug, room: roomName, price });
}

export function trackBookThisStayClicked(slug: string, totalPrice: number) {
  safeTrack("book_this_stay_clicked", { slug, total_price: totalPrice });
}

// ============================================
// D. CHECKOUT STEP 2 — GUEST INFO
// ============================================

export function trackCheckoutStep2Viewed(slug: string, totalPrice: number) {
  safeTrack("checkout_step2_viewed", { slug, total_price: totalPrice });
}

export function trackFormFieldInteracted(fieldName: string) {
  safeTrack("form_field_interacted", { field: fieldName });
}

export function trackSpecialRequestAdded(slug: string) {
  safeTrack("special_request_added", { slug });
}

// ============================================
// E. CHECKOUT STEP 3 — REVIEW & CONFIRM
// ============================================

export function trackCheckoutStep3Viewed(slug: string, totalPrice: number) {
  safeTrack("checkout_step3_viewed", { slug, total_price: totalPrice });
}

export function trackPaymentInitiated(slug: string, totalPrice: number, currency: string) {
  safeTrack("payment_initiated", { slug, total_price: totalPrice, currency });
}

export function trackBookingCompleted(
  bookingRef: string,
  slug: string,
  totalPrice: number,
  currency: string,
  nights: number,
  guests: number
) {
  safeTrack("booking_completed", {
    booking_ref: bookingRef,
    slug,
    total_price: totalPrice,
    currency,
    nights,
    guests,
  });

  if (isAmplitudeReady()) {
    const identify = new amplitude.Identify();
    identify.set("has_booked", true);
    identify.add("total_spend", totalPrice);
    identify.add("total_bookings", 1);
    amplitude.identify(identify);
  }
}

export function trackBookingAbandoned(
  slug: string,
  lastStep: "step2" | "step3",
  totalPrice: number,
  timeSpentSeconds: number
) {
  if (timeSpentSeconds > 30) {
    safeTrack("booking_abandoned", {
      slug,
      last_step: lastStep,
      total_price: totalPrice,
      time_spent_seconds: Math.round(timeSpentSeconds),
    });
  }
}

export function trackBookingFailed(slug: string, errorType: string, errorMessage: string, totalPrice: number) {
  safeTrack("booking_failed", {
    slug,
    error_type: errorType,
    error_message: errorMessage,
    total_price: totalPrice,
  });
}

// ============================================
// F. NAVIGATION GLOBALE
// ============================================

export function trackLanguageSwitched(from: string, to: string) {
  safeTrack("language_switched", { from, to });
}

export function trackCurrencySwitched(from: string, to: string) {
  safeTrack("currency_switched", { from, to });
}

export function trackNavWishlistClicked(itemCount: number) {
  safeTrack("nav_wishlist_clicked", { item_count: itemCount });
}

export function trackNavCartClicked(itemCount: number) {
  safeTrack("nav_cart_clicked", { item_count: itemCount });
}

// ============================================
// G. PAGES SECONDAIRES
// ============================================

export function trackCategoryPageViewed(category: string) {
  safeTrack("category_page_viewed", { category });
}

export function trackJournalArticleViewed(articleSlug: string) {
  safeTrack("journal_article_viewed", { article: articleSlug });
}

export function trackGiftCardPageViewed() {
  safeTrack("gift_card_page_viewed");
}

export function trackPartnersPageViewed() {
  safeTrack("partners_page_viewed");
}

// ============================================
// H. SEARCH
// ============================================

export function trackSearchPerformed(query: {
  destination?: string;
  checkIn?: string;
  nights?: number;
  guests?: number;
}) {
  safeTrack("search_performed", query);
}

export function trackSearchNoResults(query: {
  destination?: string;
  checkIn?: string;
  nights?: number;
  guests?: number;
}) {
  safeTrack("search_no_results", query);
}
