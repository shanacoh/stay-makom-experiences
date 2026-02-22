

# Premium Toggle Redesign for Launch Page

## Current State
The filter toggle is a basic pill-style component with `bg-muted/50` background, simple white highlight on active state, and Compass/Heart icons. It works but feels generic and utilitarian.

## Design Vision
A refined, editorial-quality toggle that feels like a luxury brand selector — think Aesop or Aman Hotels navigation elements.

## Changes

### 1. Replace pill toggle with a segmented text toggle
- Remove the rounded-pill container with its gray background
- Use two text-only buttons separated by a thin vertical divider ("|")
- Active state: full opacity, subtle underline animation (a thin line that slides from one label to the other)
- Inactive state: reduced opacity (text-foreground/40)
- No background color changes — purely typographic

### 2. Typography upgrade
- Use uppercase, wide letter-spacing (`tracking-[0.15em]`), small text (`text-xs`)
- Font weight: medium for active, light for inactive
- This matches the editorial/luxury tone of the rest of the page

### 3. Rename "Romantic getaway" to "Romantic Escape"
- English: "Romantic Escape"
- Hebrew: "בריחה רומנטית" (already correct)

### 4. Sliding underline indicator
- A 1px-height line under the active label
- Animated with CSS `transition` (transform translateX) so it glides between the two options
- Color: foreground (black)

### 5. Remove icons
- Drop the Compass and Heart icons for a cleaner, text-first look
- The toggle becomes purely typographic, which is more premium

---

## Technical Details

### File: `src/pages/LaunchIndex.tsx` (lines 238-263)

Replace the current toggle block with a new component:

```text
  Container: inline-flex, items-center, gap-6
  
  Button 1: "FEEL ADVENTUROUS"
    - uppercase, tracking-[0.15em], text-xs, font-medium or font-light
    - Active: opacity-100, after pseudo-element underline
    - Inactive: opacity-40, hover:opacity-70
    
  Divider: thin vertical line (w-px h-4 bg-foreground/20)
  
  Button 2: "ROMANTIC ESCAPE"  
    - Same styling as Button 1
```

Since Tailwind pseudo-element underlines are complex inline, the active underline will be implemented as a separate `div` with absolute positioning under the active button, using a `ref` to measure width and offset, animated via `transition-all duration-300`.

### Implementation approach
- Create two `button` refs to measure their position
- Track which is active
- Render a thin absolute-positioned bar that animates its `left` and `width` to match the active button
- Wrap in a `relative` container

This keeps everything inside `LaunchIndex.tsx` without needing a separate component file, staying consistent with the current pattern.
