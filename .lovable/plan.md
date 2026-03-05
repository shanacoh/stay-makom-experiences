

## Diagnostic: Hotel Prices Not Showing

### Root Cause

The hotel linked to your experience ("The Farmhouse Batshlomo") has **no HyperGuest property ID** (`hyperguest_property_id: null`). This means the system cannot fetch real-time room prices from the booking API.

The pricing banner (`HeroBookingPreview2`) requires a valid `hyperguest_property_id` to call the HyperGuest availability API. Without it, the price scan is skipped entirely. The fallback only shows addon-based prices (per person fees, etc.), not room prices.

### Two Possible Solutions

**Option A — Import the hotel from HyperGuest (recommended if available)**
If this hotel exists in HyperGuest's system, use the admin hotel import tool to re-import it with a valid property ID. This will automatically populate `hyperguest_property_id` and enable real-time pricing.

**Option B — Manual base price fallback**
If the hotel is NOT on HyperGuest (manual property), we can implement a fallback that uses the experience's `base_price` field or a new manual room price field on `hotels2` to display a static "Starting from" price in the booking banner when no HyperGuest ID is present.

### What I Can Implement (Option B)

1. **Update `HeroBookingPreview2`** — Add fallback logic to show `experience.base_price` when `hyperguestPropertyId` is null, so the "Starting from" banner still appears with a manually set price.
2. **Update `BookingPanel2`** — Allow manual pricing mode when HyperGuest is unavailable, using `base_price` from the experience record.

### What You Need to Check

- Does "The Farmhouse Batshlomo" exist in HyperGuest? If yes, you need to set the `hyperguest_property_id` in the admin hotel editor.
- If it doesn't exist in HyperGuest, do you want to set a manual `base_price` on the experience to show a static price?

