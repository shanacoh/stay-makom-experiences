/**
 * Zod schema for experience addon validation
 * Addons represent commissions and taxes, not the experience price
 */

import { z } from 'zod';

// Base schema without refine for extend/partial compatibility
const baseAddonSchema = z.object({
  type: z.enum(['commission', 'per_night', 'tax'], {
    required_error: 'Addon type is required'
  }),
  name: z.string()
    .min(1, 'Name is required')
    .max(255, 'Name cannot exceed 255 characters'),
  name_he: z.string()
    .max(255, 'Hebrew name cannot exceed 255 characters')
    .optional()
    .nullable(),
  description: z.string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional()
    .nullable(),
  description_he: z.string()
    .max(1000, 'Hebrew description cannot exceed 1000 characters')
    .optional()
    .nullable(),
  value: z.number()
    .positive('Value must be positive')
    .finite('Value must be a valid number'),
  is_percentage: z.boolean().default(false),
  calculation_order: z.number()
    .int('Order must be an integer')
    .min(0, 'Order must be positive or zero')
    .default(0)
});

// Schema with additional validation for form
export const addonFormSchema = baseAddonSchema.refine(
  (data) => {
    // If percentage, value must be between 0 and 100
    if (data.is_percentage) {
      return data.value >= 0 && data.value <= 100;
    }
    return true;
  },
  {
    message: 'A percentage must be between 0 and 100',
    path: ['value']
  }
);

export type AddonFormSchemaData = z.infer<typeof addonFormSchema>;

// Schema for complete creation (with experience_id)
export const addonCreateSchema = baseAddonSchema.extend({
  experience_id: z.string().uuid('Experience ID must be a valid UUID')
});

export type AddonCreateData = z.infer<typeof addonCreateSchema>;

// Schema for updates (all fields optional except ID)
export const addonUpdateSchema = baseAddonSchema.partial().extend({
  id: z.string().uuid('ID must be a valid UUID')
});

export type AddonUpdateData = z.infer<typeof addonUpdateSchema>;
