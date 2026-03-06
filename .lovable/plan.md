

## Current Scroll Flow

```text
1. Hero (full-bleed photo)
2. How It Works banner
3. Handpicked Hotels + Experience Grid
4. Marquee Banner
5. Brand Statement (full-bleed photo + text)
6. "More Experiences on the Way" + Category Cards
7. Gift Card section
8. "Looking for something truly unique?" ← plain text banner, feels flat
9. Footer
```

The problem: Section 8 is a simple text+button row at the very bottom with no visual weight. After the gift card section (which has a photo), it feels like an afterthought. Users scroll past it without engaging.

## Proposed Solution

Transform the Tailored Request section into a **full-bleed visual block with a background image** (similar to section 5, the Brand Statement), and move it **right after the category cards** (end of section 6), before the Gift Card section. This creates a natural flow:

> "More experiences are coming" → category cards → **"Can't find what you want? Let us design it for you"** → Gift Card → Footer

### Changes

**`src/components/TailoredRequestSection.tsx`** — Redesign the banner portion:
- Replace the plain `py-10` section with a full-width block using a background image (reuse `desert-journey.jpg` or `handpicked-hero.jpg` — one of the existing atmospheric assets) with a dark overlay
- Center the text and CTA button over the image, white text
- Increase heading size to match other full-bleed sections (`text-xl sm:text-2xl md:text-3xl font-bold`)
- Keep the "DESIGN MY STAY" button prominent with a white/light style that pops against the dark overlay
- The dialog form stays exactly as-is (no changes to functionality)

**`src/pages/LaunchIndex.tsx`** — Move the `<TailoredRequestSection>` from after the Gift Card section (line 487) to **inside section 6**, right after the category cards grid (after line 443, before the closing `</section>` of the "More experiences" block). This places it as the natural conclusion of the "coming soon" section.

### Visual Result

```text
1. Hero
2. How It Works
3. Experience Grid
4. Marquee
5. Brand Statement (photo)
6. "More Experiences" + Categories + "Design My Stay" (photo CTA)
7. Gift Card
8. Footer
```

The tailored request becomes a visually striking call-to-action embedded in the discovery flow, not an isolated afterthought.

