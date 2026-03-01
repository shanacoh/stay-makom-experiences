
# Fix: Category Waitlist Email Submission

## Problem
The email submission fails because the `leads` table has a database CHECK constraint (`leads_source_check`) that only allows these source values:
`newsletter`, `contact`, `partners`, `corporate`, `win_trip`, `landing_page`, `coming_soon`, `ai_assistant_save`

The value `category_waitlist` is not in this list, so the INSERT is rejected with error code `23514`.

The edge function code is correct -- the issue is purely at the database level.

## Fix
A single database migration to update the CHECK constraint:

```sql
ALTER TABLE public.leads DROP CONSTRAINT leads_source_check;
ALTER TABLE public.leads ADD CONSTRAINT leads_source_check 
  CHECK (source = ANY (ARRAY[
    'newsletter', 'contact', 'partners', 'corporate', 
    'win_trip', 'landing_page', 'coming_soon', 
    'ai_assistant_save', 'category_waitlist'
  ]));
```

## What already works (no code changes needed)
- The `collect-lead` edge function already handles `category_waitlist` correctly (line 159)
- The frontend (`LaunchIndex.tsx`) already sends `source: "category_waitlist"`, `cta_id`, and `metadata.category_name` properly
- The backoffice Leads page already displays `source`, `cta_id`, and `metadata` columns, so category info will be visible to admins

## Result
After this single migration:
- Users can submit their email from the category waitlist popup
- The lead is saved with the category ID and name in metadata
- Admins can see which category the lead came from in the Leads backoffice
