

# Mobile Responsive Enhancement - Launch Page & Experience Cards

## Problem Summary
From the mobile screenshot (390px), several issues are visible:
- **Experience Cards**: Highlight tags wrap across 3+ lines on mobile, overwhelming the card content. Tags like "NIGHT", "DINNER", "BREAKFAST", "COOKING CLASS" stack vertically and push content down.
- **No price visible** on cards in the current view (price may be 0 or hidden).
- **Hotel name truncated** ("Kedma by...") with no region shown clearly.
- **HowItWorks banner**: Steps stack vertically taking too much vertical space on mobile.
- **Toggle filter**: "FEEL ADVENTUROUS" and "ROMANTIC ESCAPE" labels are cramped with icons.
- **Hero section**: Generally fine but CTA button could be more prominent on small screens.

## Changes

### 1. ExperienceCard - Mobile-Optimized Tag Display
**File: `src/components/ExperienceCard.tsx`**

- On mobile, limit tags to **max 2** (currently 4 max, but all 4 show and wrap badly).
- Use `useIsMobile()` hook to conditionally show 2 tags on mobile, 4 on desktop.
- Make tags single-line with `truncate` if needed, use smaller font/padding on mobile.
- Ensure price line is always visible even when base_price exists.
- Force currency to `$` (matching the DualPrice USD-only change already made).
- Tighten spacing: reduce `gap-1` to `gap-0.5` on tag container for mobile.

### 2. ExperienceCard - Cleaner Info Hierarchy
**File: `src/components/ExperienceCard.tsx`**

- Hotel name + region: ensure `line-clamp-1` works properly, show region as secondary text.
- Rating: keep compact, already fine.
- Tags: render as a single scrollable row on mobile (no wrapping) using `flex-nowrap overflow-hidden`.
- Price: ensure `$` symbol is always used (replace currency logic to always show `$`).

### 3. HowItWorksBanner - Horizontal on Mobile
**File: `src/components/HowItWorksBanner.tsx`**

- Change mobile layout from `flex-col` to a compact horizontal row.
- Reduce text size on mobile to `text-xs` and number to `text-base`.
- Use a single-line horizontal layout with dots between steps even on mobile.

### 4. Launch Page Toggle Filter - Mobile Polish
**File: `src/pages/LaunchIndex.tsx`**

- Reduce toggle text size on mobile from `text-xs` to a tighter treatment.
- Ensure the toggle fits cleanly within the viewport.
- Reduce section heading sizes slightly on mobile for better density.

### 5. Launch Page - Section Spacing
**File: `src/pages/LaunchIndex.tsx`**

- Tighten vertical padding between sections on mobile (`py-[26px]` is fine, but some sections like brand statement and categories have too much padding on mobile).
- Gift card section: reduce gap on mobile.

## Technical Details

### ExperienceCard tag rendering (key change):
```text
Current: flex-wrap gap-1 showing up to 4 tags --> wraps to 3 lines on mobile
New: flex-nowrap overflow-hidden on mobile, max 2 tags, gap-0.5
     flex-wrap on desktop, max 4 tags
```

### HowItWorksBanner (key change):
```text
Current: flex-col sm:flex-row --> fully stacked on mobile
New: flex-row on all sizes, compact text, dots visible
```

### Files to modify:
1. `src/components/ExperienceCard.tsx` - Tag display, currency, mobile density
2. `src/components/HowItWorksBanner.tsx` - Horizontal layout on all sizes
3. `src/pages/LaunchIndex.tsx` - Toggle sizing, section spacing
4. `src/pages/Experiences.tsx` - Same card improvements apply (uses same ExperienceCard)

