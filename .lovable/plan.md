

## Plan: Premium "Tailored Experience Request" Section

### What
A new elegant section inserted before the footer on `/launch`, allowing visitors to describe their dream stay. Data is captured as a "simple" lead via the existing `collect-lead` Edge Function with source `tailored_request`, storing all form answers in `metadata`.

### Database Change
Add `tailored_request` to the `leads_source_check` constraint so the edge function can store this new source. The collect-lead function already handles simple sources — we just need to add the new value to the allowed list.

**Migration SQL:**
```sql
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_source_check;
ALTER TABLE public.leads ADD CONSTRAINT leads_source_check 
  CHECK (source IN ('landing_page', 'ai_assistant_save', 'coming_soon', 'category_waitlist', 'tailored_request'));
```

### Edge Function Update
Add `'tailored_request'` to the simple sources array in `collect-lead/index.ts` (line 159).

### New Component: `src/components/TailoredRequestSection.tsx`

A self-contained component with:

**Layout & Design:**
- Max-width ~640px, centered, generous vertical padding
- Soft background (bg-muted/30 or similar), no hard borders
- Inputs styled as refined cards: rounded-xl, subtle shadow, elegant focus ring using accent color
- Button uses the existing `cta` variant (terracotta rounded-full)
- Subtle hover transitions on all interactive elements
- Mobile-first, single column

**Fields (all stored in metadata JSON):**
1. **Mood** — Multi-select chips from categories (fetched from DB) + "Other" with text input
2. **Occasion** — Custom Select dropdown (9 options + Other with text input)
3. **When** — Select dropdown (5 options)
4. **Budget** — Select dropdown (5 options)
5. **Number of people** — Select dropdown (4 options)
6. **Tell us what you have in mind** — Textarea (placeholder: "Describe your dream stay...")
7. **Email** — Required text input

**Submission:** Calls `collect-lead` with `source: "tailored_request"` and all form data in `metadata`.

**Success state:** Replaces form with a refined confirmation (title "Thank you", message about matching upcoming experiences).

**Legal microcopy:** Small text under button linking to Terms & Privacy.

**Bilingual:** Full EN/HE support matching existing getCopy pattern.

### LaunchIndex.tsx Changes
- Import and render `<TailoredRequestSection />` between the Gift Card section and `<LaunchFooter />`.
- Pass categories data to avoid duplicate fetch.

### Files Modified
1. `supabase/functions/collect-lead/index.ts` — add `tailored_request` to simple sources
2. `src/components/TailoredRequestSection.tsx` — new component
3. `src/pages/LaunchIndex.tsx` — insert section before footer

