

# Plan: Redesign "Who STAYMAKOM is for" Section

## Overview
Simplify the section to 2 cards (Travelers + Israelis) with a lighter, warmer design that matches the site's premium aesthetic.

## Design Changes

### Current Issues
- Dark overlay (60-70% black) feels heavy
- Glassmorphism cards don't match the rest of the site
- 3 columns with "Hotels" card not needed

### New Design Direction
Inspired by the Journal, Gift Card, and About sections:

| Element | Before | After |
|---------|--------|-------|
| Background | Dark image + heavy overlay | Warm beige `#FAF8F5` (no image) |
| Cards | Glass blur, white/10 | White cards with subtle shadow |
| Icons | White on dark circles | Primary color on light circles |
| Text | White / white/70 | Dark foreground colors |
| Grid | 3 columns | 2 columns, centered |

### Visual Result
```text
+----------------------------------------+
|       Warm beige background            |
|                                        |
|     "Who STAYMAKOM is for"             |
|                                        |
|   +----------------+  +----------------+|
|   | [Plane icon]   |  | [MapPin icon]  ||
|   |                |  |                ||
|   | International  |  | Israelis       ||
|   | Travelers      |  | rediscovering  ||
|   |                |  | their country  ||
|   +----------------+  +----------------+|
|                                        |
+----------------------------------------+
```

## File Changes

### `src/pages/Index.tsx` (lines 457-526)

1. **Remove**: Background image, dark overlay, glassmorphism
2. **Add**: Light beige background (`bg-[#FAF8F5]`)
3. **Update**: Grid from 3 to 2 columns (`md:grid-cols-2`)
4. **Delete**: Hotels card (Card 3)
5. **Restyle**: Cards to white with shadows, icons to primary color

### Updated Code Structure

**Section container:**
```tsx
<section className="py-12 md:py-16 bg-[#FAF8F5]">
```

**Cards:**
```tsx
<div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm 
                hover:shadow-md transition-shadow">
  <div className="w-12 h-12 rounded-full bg-primary/10 
                  flex items-center justify-center mb-4">
    <Plane className="h-6 w-6 text-primary" />
  </div>
  <h3 className="text-foreground ...">Title</h3>
  <p className="text-muted-foreground ...">Description</p>
</div>
```

### Content (unchanged)

**Card 1 - International Travelers**
- EN: "Travelers looking for more than a hotel"
- HE: "מטיילים שמחפשים יותר ממלון"

**Card 2 - Israelis**
- EN: "Israelis rediscovering their own country"  
- HE: "ישראלים שמגלים מחדש את הארץ"

## Summary
- Remove dark image background and Hotels card
- 2 clean white cards on warm beige background
- Matches the site's light, premium aesthetic
- Icons: `Plane` for travelers, `MapPin` for Israelis

