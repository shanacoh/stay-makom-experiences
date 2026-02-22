

## Hero Section Adjustments for Launch Page

### Goal

The first viewport (what the user sees on arrival without scrolling) should show:
- The hero image with title, subtitle, and CTA
- The "How it works" banner
- The "Handpicked Hotels / Unforgettable Experiences" heading
- The subtitle "For 24 hours, 48 hours, or tailor-made experiences."
- **Stop right before the pill toggle filter** (the toggle must NOT be visible)

No orange CTA. Keep the current white CTA style. No full-screen hero.

### Changes

**File: `src/pages/LaunchIndex.tsx`**

1. **Hero height**: Change `h-[60vh] min-h-[380px]` to approximately `h-[50vh] min-h-[340px]` — shorter so the content below (banner + heading + subtitle) fits in the viewport before the toggle.

2. **Overlay**: Darken from `bg-black/35` to `bg-black/45` for better text readability.

3. **Tighter spacing**: Reduce `mb-6` (title) to `mb-4`, and `mb-10` (subtitle) to `mb-7`.

4. **CTA styling**: Keep white background, but refine for a more premium feel — add `shadow-md`, slightly more padding, and a subtle `hover:-translate-y-0.5 hover:shadow-lg` lift effect. No color change.

5. **Entrance animations**: Add staggered fade-in-up animations to the hero title, subtitle, and CTA using custom keyframes.

**File: `tailwind.config.ts`**

6. Add `hero-fade-up` keyframe: opacity 0 + translateY(25px) to opacity 1 + translateY(0), duration ~0.8s ease-out, with `animation-fill-mode: forwards`.

7. Add animation utilities with staggered delays:
   - `animate-hero-fade-up` (base)
   - Applied via inline `animationDelay` styles: 0ms (title), 250ms (subtitle), 500ms (CTA)

### Technical Details

- Hero elements will start with `opacity-0` and the animation fills forward to `opacity-1`
- The keyframe uses `forwards` fill mode so elements stay visible after animation
- No new dependencies required
- Only two files modified: `LaunchIndex.tsx` and `tailwind.config.ts`

