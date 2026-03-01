

# Launch Page -- Full UX/UI Revision

## 1. Fix: Waitlist email submission fails (critical bug)

The category waitlist popup sends `source: "category_waitlist"` to the backend function, but that function only recognizes `"coming_soon"` and `"ai_assistant_save"` as simple email sources. Everything else goes through full B2C validation (requiring first name, last name, country, interests), which causes the error.

**Fix:** Update the `collect-lead` edge function to also handle `"category_waitlist"` as a simple email source, storing the category info in metadata so it appears in the backoffice.

**File:** `supabase/functions/collect-lead/index.ts`
- Add `"category_waitlist"` to the simple email source check (line 159)
- Store `cta_id` (category ID) and `metadata.category_name` in the leads table so admins can see which category the lead came from

## 2. Fix: Waitlist popup button text cleanup

Remove the em-dash from `"Notify me -- be the first to know"` and replace with a cleaner text like `"Notify me"` with a subtitle below.

**File:** `src/pages/LaunchIndex.tsx` (line 538)

## 3. Fix: Category hover description not fully visible

The description text gets cut off on small cards because `line-clamp-3` at `text-[8px]` is too restrictive. Improve:
- Increase the dark overlay on hover to `bg-black/55` for better readability
- Use slightly larger text: `text-[9px]` on mobile, `sm:text-xs`
- Use `line-clamp-4` on mobile too
- Add a subtle gradient from bottom for better text contrast

**File:** `src/pages/LaunchIndex.tsx` (lines 414-438)

## 4. Fix: Category title too small on reduced/tablet screens

Increase category card title from `text-[10px]` to `text-xs` on mobile and adjust the intermediate breakpoints.

**File:** `src/pages/LaunchIndex.tsx` (line 423)

## 5. Fix: HowItWorksBanner broken on tablet

The banner uses `flex-col` on mobile and `flex-row` on sm+, but on tablet the items can overflow. Fix by:
- Adding `flex-wrap` for safety
- Adjusting gaps to be more proportional at tablet sizes
- Ensuring the dots separator and text remain properly aligned at all breakpoints

**File:** `src/components/HowItWorksBanner.tsx`

## 6. General UX/UI polish

Minor refinements across the page:
- Tighten spacing consistency between sections
- Ensure the "More experiences" section email form has consistent styling
- Verify font sizes scale smoothly across breakpoints

---

## Files modified

| File | Changes |
|------|---------|
| `supabase/functions/collect-lead/index.ts` | Add `category_waitlist` to simple email sources |
| `src/pages/LaunchIndex.tsx` | Fix button text, hover descriptions, title sizes |
| `src/components/HowItWorksBanner.tsx` | Fix tablet layout |

## Technical detail

### Edge function fix (collect-lead)

Change line 159 from:
```
if (requestData.source === 'ai_assistant_save' || requestData.source === 'coming_soon') {
```
to:
```
if (['ai_assistant_save', 'coming_soon', 'category_waitlist'].includes(requestData.source)) {
```

And ensure `cta_id` is saved:
```typescript
const { data, error } = await supabase
  .from('leads')
  .insert([{
    source: requestData.source,
    email: requestData.email.toLowerCase().trim(),
    cta_id: requestData.cta_id || null,
    metadata: requestData.metadata || {},
    marketing_opt_in: true,
    is_b2b: false,
  }])
```

This ensures the category name and ID are stored, visible in the admin Leads section.

### Category cards hover improvement

Replace the hover overlay with a gradient-based approach for better text readability:
```tsx
{desc && (
  <div className="absolute inset-0 flex flex-col items-center justify-center p-3 md:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50">
    <h3 className="text-xs sm:text-sm md:text-base font-bold text-white uppercase mb-1">
      {catTitle}
    </h3>
    <p className="text-[9px] sm:text-xs md:text-sm text-white/90 text-center leading-snug line-clamp-4">
      {desc}
    </p>
  </div>
)}
```

### HowItWorksBanner tablet fix

Use a more robust layout that handles tablet widths without overflow, keeping consistent alignment of numbers and text.
