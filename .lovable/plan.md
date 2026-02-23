

# About Page — Hero Title, Founder Text, Icons, and CTA Restyle

## Issues to Fix

1. **Hero has no visible title** — Currently only shows a tiny tagline + "STAYMAKOM". Needs a real headline like the launch page hero (e.g., "Don't choose a city, choose your escape")
2. **Two Audiences section needs icons** — Add `MapPin` for Israeli Travelers and `Globe` for International Visitors to make it more visual
3. **Founder (Shana) text needs rewriting** — Replace with the exact text provided by the user
4. **Dark sections (`bg-[#1a1a1a]`) must be removed** — The "What Makes STAYMAKOM Different" section and Final CTA both use dark backgrounds which don't match the DA. Replace with light alternatives
5. **Red CTA button must go** — Replace with the white/neutral button style used on the launch page

## Changes

### 1. Hero — Add a real headline (like launch page)

Add a large, bold h1 title with staggered fade-up animation, matching the launch hero pattern:
- Title: "Reimagining how you experience Israel" (currently used as the tiny tagline)
- Move "STAYMAKOM" to be the small uppercase tagline above the title
- Same animation pattern as launch page (`animate-hero-fade-up` with staggered delays)

### 2. Two Audiences — Add subtle icons

- Import `MapPin` and `Globe` from `lucide-react`
- Add `MapPin` (size 18, strokeWidth 1.5) next to "For Israeli Travelers" heading
- Add `Globe` (size 18, strokeWidth 1.5) next to "For International Visitors" heading
- Icons inline with the heading text, same color as foreground

### 3. Founder text — Use exact provided text

Replace the 3 founder paragraphs with the user's exact text (split into 4 paragraphs):
- P1: "I spent seven years developing and structuring a hospitality brand in France. But Israel has always been part of my life. I've been coming here every year since I was little (mostly to Tel Aviv and Jerusalem) and yet I kept feeling like I was only scratching the surface."
- P2: "The most meaningful places weren't obvious. The most unique stays were hard to discover. Everything felt fragmented."
- P3: "So I built what I couldn't find."
- P4: "STAYMAKOM started as something personal, a way to experience Israel beyond the familiar, by bringing together exceptional hotels and thoughtfully curated experiences in one seamless journey. Because in a country this layered, where you stay should be part of the story."

(All "-" replaced with "," as requested)

### 4. Remove all dark backgrounds

- **"What Makes STAYMAKOM Different"** section: Change `bg-[#1a1a1a] text-white` to `bg-background` with dark foreground text. Update all `text-white/85`, `text-white/40`, `text-white/50` to appropriate `text-muted-foreground` / `text-foreground` equivalents.
- **Final CTA** section: Change `bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] text-white` to `bg-[#FAF8F5]` with dark text.

### 5. CTA buttons — Match launch page style

Replace the red button + white outline button with:
- Primary: White/neutral filled button like launch page: `bg-foreground text-white hover:bg-foreground/90` (dark button, clean)
- Secondary: Outline button with dark border: `border-foreground/30 text-foreground hover:bg-foreground/5`

## Technical Details

### Files to modify

**`src/pages/About.tsx`**:
- Restructure hero: swap tagline and title positions, add `animate-hero-fade-up` animations
- Import `MapPin`, `Globe` from `lucide-react`
- Add icons to the Two Audiences headings
- Change "Different" section from dark to light (`bg-background`)
- Change CTA section from dark gradient to `bg-[#FAF8F5]` with dark text
- Update CTA button classes to neutral/foreground style
- Add a 4th founder paragraph key (`aboutFounderP4`)

**`src/lib/translations.ts`**:
- Update `aboutFounderP1`, `aboutFounderP2`, `aboutFounderP3` with new text
- Add `aboutFounderP4` for the final paragraph
- Update Hebrew equivalents for founder paragraphs

