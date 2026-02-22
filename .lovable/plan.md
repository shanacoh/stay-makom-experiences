

# About Page Redesign — Premium Editorial Overhaul

## Problem
The current About page feels disconnected from the rest of the site. It uses generic card layouts, red accent colors (#D72638), font-serif headings, and rounded-2xl containers that don't match the refined, editorial aesthetic established on the Launch and Homepage.

## Design Direction
Align with the Launch page's visual language: **Inter (font-sans)**, uppercase tracking-wide headings, minimal containers, generous whitespace, dark/light contrast sections, and a cinematic hero.

## New Page Structure (7 sections)

### 1. HERO — Full-bleed desert landscape
- Use the uploaded desert road photo as background
- Height: `h-[60vh] min-h-[400px]` (matching launch proportions)
- Dark overlay `bg-black/40`
- Centered text: tagline in uppercase tracking-wide + "STAYMAKOM" in large bold sans
- Staggered fade-up animations (same as launch hero)
- Font: Inter (font-sans), not serif

### 2. WHY ISRAEL. WHY NOW. — Editorial text block
- White background, max-w-3xl centered
- Uppercase small tracking-wide section label
- Body text from the PDF: "A country this layered deserves better..." paragraph
- Replace all "-" mid-sentence with ","
- Clean typography, no cards, no icons

### 3. TWO AUDIENCES — Side by side
- Minimal two-column layout (no gradient cards, no rounded-2xl)
- Left: "Israeli Travelers" / Right: "International Visitors"
- Text from PDF with refined copy
- Thin top border or subtle divider instead of card borders
- Font-sans throughout

### 4. WHAT MAKES STAYMAKOM DIFFERENT — Dark section
- `bg-[#1a1a1a]` background (consistent with launch)
- Bullet points without CheckCircle icons, use thin dashes or em-dashes instead
- Clean, editorial list
- Closing italic quote

### 5. THE NAME — Light section
- Brief, centered text explaining "Makom"
- Minimal styling, generous padding

### 6. FOUNDER — Shana's section (placed lower as requested)
- Two-column layout: B&W photo on one side, text on other
- Photo: the uploaded WhatsApp image (B&W portrait)
- Text from PDF: "I spent 7 years building a hotel brand..." (with "-" replaced by ",")
- Uppercase label "THE FOUNDER" with tracking-wide
- Name "SHANA" as heading
- Subtitle "Founder and CEO"
- This section intentionally placed lower on the page, not near the hero

### 7. FINAL CTA — Dark gradient
- Same style as current but with font-sans headings
- Two buttons: "Explore Curated Stays" + "Get on the List"

## Technical Details

### Files to modify

**1. `src/pages/About.tsx`** — Complete restructure:
- Replace hero image import with new desert photo
- Add import for Shana's photo
- Remove all font-serif references, use font-sans
- Remove all `rounded-2xl`, `shadow-sm` card patterns
- Remove icon-heavy sections (Users, MapPin, Hotel, Globe, Heart icons)
- Remove CheckCircle bullet points, use typographic dashes
- Remove red accent circles (#D72638/10 backgrounds)
- Restructure sections in new order
- Add hero fade-up animations matching launch page
- Keep all `t(lang, ...)` translation keys but update them

**2. `src/lib/translations.ts`** — Update English and Hebrew about page strings:
- New hero tagline
- New "Why Israel" section content from PDF
- Updated founder section content
- Updated two-audiences text (from PDF)
- Replace all "-" mid-sentence with ","
- Add new translation keys: `aboutFounderLabel`, `aboutFounderName`, `aboutFounderP1`, `aboutFounderP2`, `aboutFounderP3`, `aboutWhyIsraelTitle`, `aboutWhyIsraelP1`, `aboutWhyIsraelP2`, `aboutWhyIsraelP3`
- Remove unused keys from old sections (aboutWhoFor3Title/Desc for hotels card, aboutHowItWorks steps)

**3. Assets** — Copy two uploaded images to `src/assets/`:
- Desert landscape to `src/assets/about-hero-desert-new.png`
- Shana photo to `src/assets/founder-shana.jpg`

### Typography rules (matching launch page)
- Section labels: `font-sans text-xs uppercase tracking-[0.15em] text-muted-foreground`
- Section headings: `font-sans text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-[-0.02em]`
- Body text: `font-sans text-base md:text-lg leading-relaxed text-muted-foreground`
- No font-serif anywhere on the page

### Color palette
- Backgrounds alternate: white / `#FAF8F5` / `#1a1a1a`
- No red (#D72638) accent circles or icon backgrounds
- CTA buttons keep red for action: `bg-[#D72638]`
- Text: foreground / muted-foreground / white (on dark sections)

