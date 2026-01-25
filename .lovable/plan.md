

## Plan: Share Section - More Visible + Left Aligned

Small adjustments to make the share section slightly more prominent and aligned to the left.

---

### Changes

**File:** `src/components/experience/ShareWithFriendsSection.tsx`

**Current state (line 54):**
```tsx
<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
```

**Updated state:**
```tsx
<div className="flex items-center justify-start gap-2 text-sm text-foreground/60">
```

**Adjustments:**
1. **Left alignment:** Change `justify-center` to `justify-start`
2. **Slightly more visible text:** Change `text-muted-foreground` to `text-foreground/60` (a bit darker)
3. **Slightly larger share button:** Increase opacity from `text-primary/80` to `text-primary` for better visibility

---

### Technical Details

| Property | Before | After |
|----------|--------|-------|
| Alignment | `justify-center` | `justify-start` |
| Text color | `text-muted-foreground` | `text-foreground/60` |
| Button color | `text-primary/80` | `text-primary` |

