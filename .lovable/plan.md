

# Correction des tags et prix sur la page listing Experiences 2

## Probleme identifie

Apres analyse de la base de donnees et du code :

1. **Tags manquants** : La requete dans `Experiences2.tsx` ne recupere pas les `experience2_highlight_tags`. Les tags existent bien en base (13 tags pour "Desert Flavors", 3 pour "TEST NIGHT + MASSAGE") mais ne sont jamais charges.

2. **Prix a 0** : Le champ `base_price` vaut 0 dans la table `experiences2` car le systeme V2 utilise les addons (`experience2_addons`) pour definir les prix (ex: "Massage 400 ILS/personne"). La carte affiche `base_price` directement, qui est 0.

## Corrections prevues

### 1. Ajouter les highlight tags a la requete de listing

Dans `src/pages/Experiences2.tsx`, ajouter `experience2_highlight_tags(highlight_tags(*))` a la requete Supabase, puis mapper les donnees vers la prop `experience_highlight_tags` attendue par `ExperienceCard`.

### 2. Calculer un prix d'affichage a partir des addons

Dans `src/pages/Experiences2.tsx`, ajouter une sous-requete pour recuperer les addons de type "pricing" (per_person, per_night, etc.) pour chaque experience. Calculer un prix "a partir de" en additionnant les addons actifs de type pricing. Ce prix sera passe a `ExperienceCard` via `base_price`.

Si aucun addon pricing n'existe et que `base_price` vaut 0, la carte n'affichera pas de prix plutot que d'afficher "0".

### 3. Masquer le prix quand il est 0

Dans `ExperienceCard.tsx`, ne pas afficher la ligne prix si `displayPrice` vaut 0 ou est indefini, pour eviter l'affichage "0 / night".

## Details techniques

**Fichiers modifies :**
- `src/pages/Experiences2.tsx` : Ajout des tags et addons a la requete + mapping
- `src/components/ExperienceCard.tsx` : Masquer le prix a 0

**Requete mise a jour (Experiences2.tsx) :**
```sql
experiences2 {
  *,
  experience2_hotels(...),
  categories(...),
  experience2_highlight_tags(tag_id, highlight_tags(*)),  -- NOUVEAU
  experience2_addons(type, value, is_active)              -- NOUVEAU
}
```

**Mapping des donnees :**
```typescript
const cardExperience = {
  ...experience,
  hotels: primaryHotelLink || null,
  // Mapper les V2 tags vers la prop V1 attendue par ExperienceCard
  experience_highlight_tags: experience.experience2_highlight_tags,
  // Calculer prix affichage depuis les addons pricing
  base_price: computeDisplayPrice(experience),
};
```

La fonction `computeDisplayPrice` additionnera les valeurs des addons actifs dont le type est `per_person`, `per_night`, `per_person_per_night` ou `fixed`.

