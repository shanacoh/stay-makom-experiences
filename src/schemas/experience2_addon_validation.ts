/**
 * Schéma Zod pour validation des ajouts d'expérience
 */

import { z } from 'zod';

// Schéma de base sans refine pour pouvoir utiliser extend/partial
const baseAddonSchema = z.object({
  type: z.enum(['commission', 'per_night', 'tax'], {
    required_error: 'Le type d\'ajout est requis'
  }),
  name: z.string()
    .min(1, 'Le nom est requis')
    .max(255, 'Le nom ne peut pas dépasser 255 caractères'),
  name_he: z.string()
    .max(255, 'Le nom hébreu ne peut pas dépasser 255 caractères')
    .optional()
    .nullable(),
  description: z.string()
    .max(1000, 'La description ne peut pas dépasser 1000 caractères')
    .optional()
    .nullable(),
  description_he: z.string()
    .max(1000, 'La description hébreu ne peut pas dépasser 1000 caractères')
    .optional()
    .nullable(),
  value: z.number()
    .positive('La valeur doit être positive')
    .finite('La valeur doit être un nombre valide'),
  is_percentage: z.boolean().default(false),
  calculation_order: z.number()
    .int('L\'ordre doit être un entier')
    .min(0, 'L\'ordre doit être positif ou nul')
    .default(0)
});

// Schéma avec validation supplémentaire pour le formulaire
export const addonFormSchema = baseAddonSchema.refine(
  (data) => {
    // Si c'est un pourcentage, la valeur doit être entre 0 et 100
    if (data.is_percentage) {
      return data.value >= 0 && data.value <= 100;
    }
    return true;
  },
  {
    message: 'Un pourcentage doit être entre 0 et 100',
    path: ['value']
  }
);

export type AddonFormSchemaData = z.infer<typeof addonFormSchema>;

// Schéma pour la création complète (avec experience_id)
export const addonCreateSchema = baseAddonSchema.extend({
  experience_id: z.string().uuid('L\'ID de l\'expérience doit être un UUID valide')
});

export type AddonCreateData = z.infer<typeof addonCreateSchema>;

// Schéma pour la mise à jour (tous les champs optionnels sauf l'ID)
export const addonUpdateSchema = baseAddonSchema.partial().extend({
  id: z.string().uuid('L\'ID doit être un UUID valide')
});

export type AddonUpdateData = z.infer<typeof addonUpdateSchema>;
