
# Header Scroll Behavior Fix — Remove Border Line

## Problem
When scrolling back up on any page, the header transitions from transparent to a solid background with `border-b border-border/40`, creating an ugly horizontal line that breaks the premium feel. This happens on both `Header.tsx` (used on most pages) and `LaunchHeader.tsx` (used on the launch page).

## Solution
Replace the hard border line with a subtle shadow that feels more refined and consistent with the luxury/editorial aesthetic. The shadow provides the same visual separation without the sharp line.

## Changes

### 1. `src/components/Header.tsx` (line 79)

**Current (scrolled state):**
```
bg-background/98 backdrop-blur-sm border-b border-border/40
```

**New:**
```
bg-background/98 backdrop-blur-sm shadow-[0_1px_8px_-2px_rgba(0,0,0,0.06)] border-none
```

A soft, barely-visible shadow replaces the hard border line. It provides separation without the "trait" (line) that disrupts the premium look.

### 2. `src/components/LaunchHeader.tsx` (line 61)

Same change as above — replace `border-b border-border/40` with `shadow-[0_1px_8px_-2px_rgba(0,0,0,0.06)] border-none` in the scrolled state class string.

Both headers already use `border-none` in their transparent (unscrolled) state, so this makes the transition smoother — no border appears or disappears, just a gentle shadow fades in.
