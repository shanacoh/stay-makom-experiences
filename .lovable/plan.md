

# Fix RLS Policies for experiences2 & experience2_hotels

## Current Issues Found

After querying the actual database, the policies are **permissive** (not restrictive as previously thought), but there are 3 real security/access issues:

1. **`experience2_hotels`** — "Authenticated users can manage experience hotels" allows **ANY logged-in user** to insert/update/delete experience-hotel links. This is a security hole.
2. **`experiences2`** — No `hotel_admin` policy exists, so hotel admins cannot manage their own experiences.
3. **`experiences2`** — Public SELECT doesn't verify the linked hotel is also `published`, so experiences can leak if the hotel is unpublished.

## Migration SQL

One migration that drops the 4 existing policies and creates 6 new ones:

### `experiences2` (3 policies)
- **Admin ALL** — `has_role(auth.uid(), 'admin')` — full access
- **Public SELECT** — `status = 'published' AND (hotel_id IS NULL OR hotel_id IN (SELECT id FROM hotels2 WHERE status = 'published'))` — ensures both experience AND hotel are published
- **Hotel admin ALL** — `has_role(auth.uid(), 'hotel_admin') AND hotel_id = get_user_hotel_id(auth.uid())` — scoped to their hotel

### `experience2_hotels` (3 policies)
- **Admin ALL** — `has_role(auth.uid(), 'admin')`
- **Public SELECT** — only for links where the experience is published
- **Hotel admin ALL** — scoped to experiences linked to their hotel

## No Code Changes Needed

The frontend queries (e.g., `useExperience2.ts`) already use standard Supabase selects — they'll automatically benefit from the corrected RLS rules. No application code changes required.

