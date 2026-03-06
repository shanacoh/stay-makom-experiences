

## Redesign "Looking for something truly unique?" section

### What changes

**1. Move position** — In `LaunchIndex.tsx`, move `<TailoredRequestSection>` from after Gift Card (line 487) to **before** it (between section 6 closing and section 7 Gift Card, around line 445).

**2. Transform into a photo hero block** — In `TailoredRequestSection.tsx`, replace the plain horizontal banner (lines 142-176) with a full-bleed image section using the uploaded desert kiosk photo as background. Structure:
- Full-width container with `bg-cover bg-center`
- Dark overlay (`bg-black/40`)
- Compact vertical padding: `py-12 sm:py-16 md:py-20` (smaller than the Brand Statement section which uses `py-8 sm:py-14 md:py-18` — roughly the same feel, not too tall)
- Centered white text: heading + subtitle
- CTA button below

**3. CTA button style** — Use the same `<Button>` with default variant (solid dark, uppercase, tracking-wide) like the "Notify me" and Gift Card buttons on the page, not the `cta` variant. This keeps visual harmony. The arrow icon stays.

**4. Copy the uploaded image** to `src/assets/tailored-request-hero.png` and import it in the component.

### New scroll flow
```
1. Hero
2. How It Works
3. Experience Grid
4. Marquee
5. Brand Statement (photo)
6. More Experiences + Categories
7. "Looking for something truly unique?" (NEW photo hero)
8. Gift Card
9. Footer
```

### Files changed
- **Copy** uploaded image to `src/assets/tailored-request-hero.png`
- **Edit** `src/components/TailoredRequestSection.tsx` — Replace banner section (lines 142-176) with photo hero block
- **Edit** `src/pages/LaunchIndex.tsx` — Move `<TailoredRequestSection>` from line 487 to before the Gift Card section (before line 447)

