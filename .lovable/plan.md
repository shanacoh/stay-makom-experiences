

## Diagnosis

The 403 error on Google Sign-In is caused by the current code using `supabase.auth.signInWithOAuth()` directly (in `OAuthButtons.tsx`), which requires manual Google OAuth credentials configuration. Since this project runs on Lovable Cloud, it should use the **managed Google OAuth** via `lovable.auth.signInWithOAuth("google", ...)` instead.

## Plan

1. **Generate the Lovable Cloud auth module** by calling the `configure-social-auth` tool for Google — this creates `src/integrations/lovable/` with the managed OAuth client.

2. **Update `OAuthButtons.tsx`** to replace:
   ```typescript
   await supabase.auth.signInWithOAuth({ provider: "google", ... })
   ```
   with:
   ```typescript
   import { lovable } from "@/integrations/lovable/index";
   await lovable.auth.signInWithOAuth("google", {
     redirect_uri: window.location.origin,
   });
   ```

This will use Lovable Cloud's managed Google credentials, eliminating the 403 error without needing any Google Cloud Console configuration.

