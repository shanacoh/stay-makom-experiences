

# Plan: Enhance Corporate Form UX & Conversion

## Overview
Refine the existing Corporate page form to be more premium, qualifying, and conversion-oriented without redesigning the page structure.

## Summary of Changes

| Area | Current | New |
|------|---------|-----|
| Phone | Optional | **Mandatory** with helper text |
| Request Types | 6 options | 6 refined options with clearer descriptions |
| Main Objective | ❌ | ✅ New dropdown field |
| Group Size | Free text | **Dropdown** with predefined ranges |
| Preferred Dates | Simple placeholder | Better placeholder guidance |
| Message | "Message (optional)" | "Additional Information (optional)" with detailed placeholder |
| Consent | ❌ | ✅ Mandatory GDPR checkbox |
| CTA | "Send Request" | "Request a tailored proposal" + micro-copy |

---

## Detailed Changes

### 1. Form Field Updates (`src/pages/Companies.tsx`)

**Zod Schema Changes:**
```typescript
const formSchema = z.object({
  fullName: z.string().trim().min(2).max(100),           // Keep
  companyName: z.string().trim().min(1).max(100),        // Now required
  email: z.string().trim().email().max(255),             // Keep
  phone: z.string().trim().min(1, "Phone is required").max(50),  // Now mandatory
  requestType: z.enum([...]),                            // Updated options
  mainObjective: z.enum([...]),                          // NEW field
  groupSize: z.enum([...]),                              // Changed to dropdown
  preferredDates: z.string().max(200).optional(),        // Keep
  message: z.string().max(1000).optional(),              // Keep
  consent: z.literal(true, { errorMap: () => ({ message: "You must agree to continue" }) })  // NEW
});
```

**New Form State:**
- Add `mainObjective` field (dropdown)
- Add `consent` checkbox (required)
- Change `groupSize` from Input to Select

### 2. Request Type Options (Radio Buttons)

**Updated enum values:**
- `corporate_retreat` → "Corporate Retreat / Offsite (Hotel + Experiences)"
- `team_building` → "Team-Building Experience (1 day or multi-days)"
- `employee_reward` → "Employee Rewards & Gift Experiences"
- `corporate_gift_cards` → "Corporate Gift Cards"
- `customized_incentive` → "Fully Customized Incentive Trip"
- `not_sure` → "Not sure yet — let's discuss"

### 3. New Field: Main Objective (Dropdown)

**Options:**
- Team bonding
- Celebration / reward
- Motivation & retention
- Leadership / strategy offsite
- Client or partner invitation
- Other

### 4. Group Size (Dropdown Options)

- 5–10 people
- 10–25 people
- 25–50 people
- 50+ people

### 5. Translation Updates (`src/lib/translations.ts`)

**New/Updated English keys:**
```typescript
companiesFullNamePlaceholder: "Your full name",
companiesCompanyNamePlaceholder: "Company name",
companiesEmailPlaceholder: "you@company.com",
companiesPhone: "Phone Number",
companiesPhoneHelper: "We may call you to refine your request",
companiesMainObjective: "Main Objective",
companiesMainObjectiveOptions: {
  team_bonding: "Team bonding",
  celebration: "Celebration / reward",
  motivation: "Motivation & retention",
  leadership: "Leadership / strategy offsite",
  client_partner: "Client or partner invitation",
  other: "Other"
},
companiesGroupSizeOptions: {
  "5-10": "5–10 people",
  "10-25": "10–25 people",
  "25-50": "25–50 people",
  "50+": "50+ people"
},
companiesPreferredDatesPlaceholder: "Month, quarter or exact dates (e.g. May 2026 / Q3 2026)",
companiesAdditionalInfo: "Additional Information (optional)",
companiesAdditionalInfoPlaceholder: "Budget range (if known), preferred location, type of hotel, experience level (relaxed / adventurous / luxury), constraints, or anything useful to design the right proposal.",
companiesConsent: "I agree to be contacted by STAYMAKOM regarding my request and to receive tailored communications about curated corporate experiences.",
companiesConsentHelper: "You can unsubscribe at any time. See our Privacy Policy for more information.",
companiesSubmitButton: "Request a tailored proposal",
companiesSubmitHelper: "We usually reply within 48 hours with a curated proposal."
```

**Hebrew translations** to be added for all new keys.

### 6. Form Layout Changes

```
┌─────────────────────────────────────┐
│  Full Name *        Company Name *  │  ← Both required now
├─────────────────────────────────────┤
│  Work Email *       Phone Number *  │  ← Phone now required + helper
├─────────────────────────────────────┤
│  Type of Request * (Radio buttons)  │  ← 6 refined options
├─────────────────────────────────────┤
│  Main Objective * (Dropdown)        │  ← NEW
├─────────────────────────────────────┤
│  Group Size *       Preferred Dates │  ← Group Size is now dropdown
├─────────────────────────────────────┤
│  Additional Information (optional)  │  ← Renamed + improved placeholder
├─────────────────────────────────────┤
│  ☐ I agree to be contacted...      │  ← NEW consent checkbox
│    Helper text with Privacy link    │
├─────────────────────────────────────┤
│  [ Request a tailored proposal ]    │  ← Refined CTA
│  "We usually reply within 48 hours" │  ← NEW micro-copy
└─────────────────────────────────────┘
```

### 7. Database Integration

The existing `leads` table already supports all fields:
- `metadata` (jsonb) will store `mainObjective`
- `marketing_opt_in` will store consent status
- All other fields map directly

**No database migration required.**

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Companies.tsx` | Schema, form fields, layout, consent checkbox, new dropdown |
| `src/lib/translations.ts` | All new/updated translation keys (EN + HE) |

## Implementation Notes

- Use existing `Select` component for dropdowns
- Use existing `Checkbox` component for consent
- Add helper text under Phone using `<p className="text-xs text-muted-foreground">`
- Add micro-copy under CTA button
- Store `mainObjective` in the `metadata` jsonb field when saving to database
- All * marked fields are required

