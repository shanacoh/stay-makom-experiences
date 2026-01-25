

## Plan: Subtle Share Section

Transform the current prominent share section into a minimal, elegant inline element.

---

### Design Approach

**Before (current):**
```text
┌────────────────────────────────────────────────┐
│              [Large Icon Circle]               │
│                                                │
│           Share with friends                   │
│   Know someone who would love this?            │
│                                                │
│      [ Share this experience ]                 │
└────────────────────────────────────────────────┘
```

**After (subtle):**
```text
───────────────────────────────────────────────────
     ↗ Know someone who'd love this? Share it
───────────────────────────────────────────────────
```

---

### Changes

**File:** `src/components/experience/ShareWithFriendsSection.tsx`

**Styling adjustments:**
- Remove the large card container with gradient background
- Remove the large icon circle
- Remove the separate title
- Reduce vertical padding from `py-8` to `py-4`
- Single line: subtle text + inline share link/button
- Use a simple horizontal separator style (optional light border top/bottom)
- Smaller button: `size="sm"` with `variant="ghost"` 
- Muted colors for text, with the share action slightly highlighted

**New compact layout:**
```tsx
<section className="py-4">
  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
    <span>{getText('prompt')}</span>
    <button 
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 text-primary/80 hover:text-primary font-medium transition-colors"
    >
      <Share2 className="h-3.5 w-3.5" />
      {getText('shareLink')}
    </button>
  </div>
</section>
```

**Updated translations:**
```tsx
prompt: {
  en: "Know someone who'd love this?",
  fr: "Quelqu'un aimerait cette expérience ?",
  he: "מכירים מישהו שיאהב?"
},
shareLink: {
  en: "Share",
  fr: "Partager",
  he: "שתפו"
}
```

---

### Result

A single, elegant line that blends naturally into the page flow — subtle enough to not distract but visible enough to encourage sharing. No borders, no cards, just clean inline text with a highlighted share action.

