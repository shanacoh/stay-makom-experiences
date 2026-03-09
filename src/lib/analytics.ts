import * as amplitude from "@amplitude/analytics-browser";
import { isAmplitudeReady } from "./amplitude";

// ── Safe wrappers ────────────────────────────────────────
const safeTrack = (eventName: string, properties?: Record<string, any>) => {
  if (!isAmplitudeReady()) return;
  amplitude.track(eventName, properties);
};

const safeIdentify = (identify: amplitude.Identify) => {
  if (!isAmplitudeReady()) return;
  amplitude.identify(identify);
};

// ── A. USER IDENTIFICATION ───────────────────────────────
export const identifyUser = (props: {
  userId?: string;
  language: string;
  deviceType: "mobile" | "desktop" | "tablet";
  isReturningUser: boolean;
  acquisitionSource?: string;
}) => {
  if (!isAmplitudeReady()) return;
  if (props.userId) amplitude.setUserId(props.userId);
  const id = new amplitude.Identify();
  id.set("language", props.language);
  id.set("device_type", props.deviceType);
  id.set("is_returning_user", props.isReturningUser);
  if (props.acquisitionSource) id.set("acquisition_source", props.acquisitionSource);
  id.setOnce("has_booked", false);
  safeIdentify(id);
  safeTrack("user_identified", {
    language: props.language,
    device_type: props.deviceType,
    is_returning_user: props.isReturningUser,
  });
};

// ── B. PAGE / LAUNCH ─────────────────────────────────────
export const trackPageViewed = (props: { pageName: string; referrer?: string }) =>
  safeTrack("page_viewed", { page_name: props.pageName, referrer: props.referrer, raw_referrer: document.referrer });

export const trackScrollDepth = (props: { pageName: string; depthPercent: number }) =>
  safeTrack("scroll_depth", { page_name: props.pageName, depth_percent: props.depthPercent });

export const trackFindEscapeClicked = () => safeTrack("find_escape_clicked");
export const trackVibeTabClicked = (props: { vibe: string }) => safeTrack("vibe_tab_clicked", props);
export const trackExperienceCardClicked = (props: { experienceName: string; position: number; vibeActive: string; source: string }) =>
  safeTrack("experience_card_clicked", props);
export const trackCategoryTileClicked = (props: { category: string }) => safeTrack("category_tile_clicked", props);
export const trackWaitlistEmailSubmitted = () => safeTrack("waitlist_email_submitted");
export const trackDesignMyStayClicked = () => safeTrack("design_my_stay_clicked");
export const trackGiftCardClicked = (props: { source: string }) => safeTrack("gift_card_clicked", props);

// ── C. EXPERIENCE PAGE ──────────────────────────────────
export const trackExperiencePageViewed = (props: { experienceName: string; hotelName: string; location: string; slug: string }) =>
  safeTrack("experience_page_viewed", props);
export const trackTimeOnExperiencePage = (props: { experienceName: string; seconds: number }) =>
  safeTrack("time_on_experience_page", props);
export const trackPhotoGalleryClicked = (props: { experienceName: string }) => safeTrack("photo_gallery_clicked", props);
export const trackShareClicked = (props: { experienceName: string }) => safeTrack("share_clicked", props);
export const trackWishlistClicked = (props: { experienceName: string }) => safeTrack("wishlist_clicked", props);
export const trackHotelLinkClicked = (props: { hotelName: string }) => safeTrack("hotel_link_clicked", props);
export const trackMapGetThereClicked = (props: { experienceName: string }) => safeTrack("map_get_there_clicked", props);
export const trackAddonViewed = (props: { addonName: string; addonPrice: number; experienceName: string }) =>
  safeTrack("addon_viewed", props);
export const trackAddonClicked = (props: { addonName: string; addonPrice: number; experienceName: string }) =>
  safeTrack("addon_clicked", props);
export const trackDurationTabClicked = (props: { duration: string; experienceName: string }) =>
  safeTrack("duration_tab_clicked", props);
export const trackDateSelected = (props: { date: string; price: number; experienceName: string }) =>
  safeTrack("date_selected", props);
export const trackRoomTypeSelected = (props: { roomName: string; roomPrice: number; experienceName: string }) =>
  safeTrack("room_type_selected", props);
export const trackViewDatesClicked = (props: { experienceName: string }) => safeTrack("view_dates_clicked", props);
export const trackBookThisStayClicked = (props: { experienceName: string; hotelName: string; roomType: string; totalPrice: number }) =>
  safeTrack("book_this_stay_clicked", props);

// ── D. CHECKOUT ──────────────────────────────────────────
export const trackCheckoutStep2Viewed = (props: { experienceName: string; totalPrice: number }) =>
  safeTrack("checkout_step2_viewed", props);
export const trackFormFieldInteracted = (props: { fieldName: string }) => safeTrack("form_field_interacted", props);
export const trackAdditionalInfoExpanded = (props: { experienceName: string }) => safeTrack("additional_info_expanded", props);
export const trackSpecialRequestTyped = (props: { experienceName: string }) => safeTrack("special_request_typed", props);
export const trackCheckoutContinueClicked = (props: { experienceName: string }) => safeTrack("checkout_continue_clicked", props);
export const trackCheckoutBackClicked = (props: { step: number; experienceName: string }) => safeTrack("checkout_back_clicked", props);
export const trackCheckoutStep3Viewed = (props: { experienceName: string; totalPrice: number }) =>
  safeTrack("checkout_step3_viewed", props);
export const trackPaymentInitiated = (props: { experienceName: string; totalPrice: number }) =>
  safeTrack("payment_initiated", props);

export const trackBookingCompleted = (props: {
  experienceName: string; hotelName: string; roomType: string;
  totalPrice: number; nights: number; adults: number; children: number;
  addonsTotal: number; addonsCount: number; acquisitionSource?: string;
}) => {
  safeTrack("booking_completed", props);
  if (isAmplitudeReady()) {
    const id = new amplitude.Identify();
    id.set("has_booked", true);
    id.add("total_spend", props.totalPrice);
    id.add("total_bookings", 1);
    amplitude.identify(id);
  }
};

export const trackBookingAbandoned = (props: { step: number; experienceName: string; timeOnStepSeconds: number }) =>
  safeTrack("booking_abandoned", props);
export const trackPaymentFailed = (props: { experienceName: string; errorReason: string }) =>
  safeTrack("payment_failed", props);

// ── E. NAVIGATION ────────────────────────────────────────
export const trackLanguageSwitched = (props: { from: string; to: string }) => safeTrack("language_switched", props);
export const trackCurrencySwitched = (props: { currency: string }) => safeTrack("currency_switched", props);
export const trackWishlistIconClicked = () => safeTrack("wishlist_icon_clicked");
export const trackCartIconClicked = () => safeTrack("cart_icon_clicked");
export const trackFooterCategoryClicked = (props: { category: string }) => safeTrack("footer_category_clicked", props);
export const trackViewAllExperiencesClicked = () => safeTrack("view_all_experiences_clicked");

// ── F. OTHER PAGES ───────────────────────────────────────
export const trackCategoryPageViewed = (props: { categoryName: string }) => safeTrack("category_page_viewed", props);
export const trackExperiencesListViewed = () => safeTrack("experiences_list_viewed");
export const trackJournalArticleViewed = (props: { articleSlug: string; referrer?: string }) =>
  safeTrack("journal_article_viewed", { ...props, raw_referrer: document.referrer });
export const trackCtaClickedFromJournal = (props: { articleSlug: string; ctaDestination: string }) =>
  safeTrack("cta_clicked_from_journal", props);
export const trackGiftCardPageViewed = () => safeTrack("gift_card_page_viewed");
export const trackPartnersPageViewed = () => safeTrack("partners_page_viewed");
export const trackPartnerFormSubmitted = () => safeTrack("partner_form_submitted");
export const trackCompaniesPageViewed = () => safeTrack("companies_page_viewed");
