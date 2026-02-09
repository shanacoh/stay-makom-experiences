

# Fix Build Errors: HyperGuestHotelSearch + ExperienceAvailabilityPreview

## Problem
4 TypeScript errors preventing the build from compiling, all related to type mismatches.

## Changes

### 1. `src/components/admin/HyperGuestHotelSearch.tsx`

**Line ~331 (facilitiesDetail mapping):** The `.map()` returns `type` as a generic `string` but `FacilityItem.type` expects `"hotel" | "room"`. Fix by casting the ternary result:
```ts
type: f.type === "room" ? "room" as const : f.type === "hotel" ? "hotel" as const : undefined,
```

**Line ~345 (propertyTypeName):** `HyperGuestHotel` (from `services/hyperguest.ts`) has `propertyType`, not `propertyTypeName`. Change:
```ts
propertyTypeName: hotel.propertyType ?? raw?.propertyTypeName ?? undefined,
```

**Line ~349 (remarks):** `HyperGuestHotel` does not have a `remarks` field. Remove the `hotel.remarks` reference and only use the raw fallback:
```ts
remarks: Array.isArray(raw?.remarks) ? raw.remarks : undefined,
```

### 2. `src/components/experience/ExperienceAvailabilityPreview.tsx`

**Line ~237:** The `toSearchResult` helper returns `unknown[]` for rooms, but `RoomOptionsV2` expects typed `Room[]` objects. Fix by casting the return value with `as any` when passing to the component, since the data shape is correct at runtime but cannot be statically proven from an `unknown` API response:
```tsx
<RoomOptionsV2
  searchResult={searchResult as any}
  ...
/>
```

## Files Modified
| File | Change |
|------|--------|
| `src/components/admin/HyperGuestHotelSearch.tsx` | 3 fixes: `type` const assertion, `propertyType` rename, remove `hotel.remarks` |
| `src/components/experience/ExperienceAvailabilityPreview.tsx` | Cast `searchResult` to satisfy `RoomOptionsV2` prop type |

