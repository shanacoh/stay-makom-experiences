

# Add Subtle Icons to Premium Toggle

## Change
Add thin, small icons (Compass and Heart) back to the toggle buttons, styled to preserve the premium editorial feel.

## Design Details
- Re-import `Compass` and `Heart` from `lucide-react`
- Place each icon before its label text with a small gap (`gap-1.5`)
- Icon size: **13px**, strokeWidth: **1.5** for a refined, thin look
- Icons inherit the same opacity transitions as the text (full opacity when active, 40% when inactive)
- Wrap each button's content in a flex row (`inline-flex items-center`)

## Technical Details

### File: `src/pages/LaunchIndex.tsx`

1. **Line 24** - Add `Compass` and `Heart` back to the lucide-react import
2. **Lines ~258-265** (Button 1) - Add `<Compass size={13} strokeWidth={1.5} />` before the text, wrap in `inline-flex items-center gap-1.5`
3. **Lines ~273-280** (Button 2) - Add `<Heart size={13} strokeWidth={1.5} />` before the text, wrap in `inline-flex items-center gap-1.5`

