
# Plan d'Implémentation - Partie Utilisateur V2 (HyperGuest + Addons)

## Vue d'Ensemble

Ce plan crée une **page publique V2** (`Experience2.tsx`) avec intégration HyperGuest pour afficher des prix/chambres en temps réel et calculer le prix final avec les commissions/taxes (`experience2_addons`).

```text
Architecture Prix V2:

+-------------------+     +------------------+     +------------------+
|  DateRangePicker  | --> |  HyperGuest API  | --> |  Prix Dynamique  |
|  (Dates client)   |     |  (Disponibilités)|     |  (Base HG)       |
+-------------------+     +------------------+     +------------------+
                                                            |
                                                            v
+-------------------+     +------------------+     +------------------+
|  experience2_     | --> |  Calcul Addons   | --> |  Prix Final      |
|  addons (DB)      |     |  (Ordre calcul)  |     |  (Breakdown)     |
+-------------------+     +------------------+     +------------------+
```

---

## Fichiers a Creer (7 fichiers)

| Fichier | Description |
|---------|-------------|
| `src/hooks/useExperience2.ts` | Hook pour recuperer une experience V2 par slug |
| `src/hooks/useHyperGuestAvailability.ts` | Hook pour appeler HyperGuest Search API |
| `src/hooks/useExperience2Price.ts` | Hook pour calculer prix avec addons |
| `src/components/experience/PriceBreakdownV2.tsx` | Affichage du breakdown de prix |
| `src/components/experience/RoomOptionsV2.tsx` | Affichage des chambres HyperGuest |
| `src/components/experience/BookingPanel2.tsx` | Panel de reservation V2 complet |
| `src/pages/Experience2.tsx` | Page publique V2 |

## Fichiers a Modifier (1 fichier)

| Fichier | Modification |
|---------|--------------|
| `src/App.tsx` | Ajouter route `/experience2/:slug` |

---

## Detail des Implementations

### 1. Hook `useExperience2.ts`

**Objectif:** Recuperer une experience V2 par slug avec relations (hotels2, categories)

**Query Supabase:**
```typescript
.from('experiences2')
.select(`
  *,
  hotels2 (
    id, name, name_he, slug, city, city_he, region, region_he,
    hero_image, photos, latitude, longitude,
    hyperguest_property_id, hyperguest_imported_at
  ),
  categories (id, name, name_he, slug)
`)
.eq('slug', slug)
.eq('status', 'published')
.single()
```

**Point cle:** Recupere `hyperguest_property_id` de `hotels2` pour les appels API HyperGuest.

---

### 2. Hook `useHyperGuestAvailability.ts`

**Objectif:** Wrapper TanStack Query autour de `getPropertyAvailability()`

**Parametres:**
- `propertyId`: ID HyperGuest de l'hotel
- `params`: `{ checkIn, nights, guests, currency }`

**Logique:**
```typescript
useQuery({
  queryKey: ['hyperguest-availability', propertyId, params],
  queryFn: () => getPropertyAvailability(propertyId, params),
  enabled: !!propertyId && !!params.checkIn && params.nights > 0,
  staleTime: 2 * 60 * 1000, // 2 minutes (prix volatils)
})
```

---

### 3. Hook `useExperience2Price.ts`

**Objectif:** Calculer le prix final avec le breakdown

**Formule:**
```text
Prix Final = Prix HyperGuest + Commissions (ordre 0) + Taxes (ordre 1+)
```

**Interface de sortie:**
```typescript
interface PriceBreakdown {
  basePrice: number;           // Prix HyperGuest
  commissions: Array<{ name: string; amount: number; type: string }>;
  taxes: Array<{ name: string; amount: number }>;
  subtotal: number;            // Base + Commissions
  totalTaxes: number;
  total: number;               // Prix final
  currency: string;
  nights: number;
}
```

**Logique de calcul:**
1. Trier addons par `calculation_order`
2. Appliquer commissions (ordre 0) sur `basePrice`
3. Appliquer taxes (ordre 1+) sur `subtotal` cumule
4. Supporter `is_percentage` (%) ou valeur fixe
5. Supporter `per_night` (multiplication par nuits)

---

### 4. Composant `PriceBreakdownV2.tsx`

**Affichage:**
```text
+----------------------------------+
|  Detail du prix                  |
+----------------------------------+
|  Prix de l'hotel      ₪1,200.00  |
|  --------------------------------|
|  Commission STAYMAKOM +₪120.00   |
|  Frais par nuit x2    +₪40.00    |
|  --------------------------------|
|  Sous-total           ₪1,360.00  |
|  --------------------------------|
|  TVA (17%)            +₪231.20   |
|  --------------------------------|
|  Total                ₪1,591.20  |
|  Prix pour 2 nuits               |
+----------------------------------+
```

---

### 5. Composant `RoomOptionsV2.tsx`

**Objectif:** Afficher les chambres reelles HyperGuest

**Props:**
```typescript
interface RoomOptionsV2Props {
  searchResult: SearchResult | null;
  isLoading: boolean;
  selectedRoomId: number | null;
  selectedRatePlanId: number | null;
  onSelect: (roomId: number, ratePlanId: number) => void;
}
```

**Affichage par chambre:**
- Nom de la chambre
- Capacite (adultes/enfants)
- Rate plans disponibles avec:
  - Nom du rate plan
  - Type de pension (getBoardTypeLabel)
  - Politique d'annulation
  - Prix total du sejour

**Utilisation des modeles existants:**
- `SearchResult`, `SearchRoom`, `SearchRatePlan` de `src/models/hyperguest`
- `getBoardTypeLabel` de `src/services/hyperguest`

---

### 6. Composant `BookingPanel2.tsx`

**Architecture:**
```text
+----------------------------------+
|  Reserver cette experience       |
+----------------------------------+
|  [DateRangePicker]               |  <-- Composant existant
|  --------------------------------|
|  Nombre de personnes: [- 2 +]    |
|  --------------------------------|
|  [RoomOptionsV2]                 |  <-- Nouveau
|  --------------------------------|
|  [PriceBreakdownV2]              |  <-- Nouveau
|  --------------------------------|
|  [Reserver pour ₪X,XXX]          |
+----------------------------------+
```

**Flux de donnees:**
1. User selectionne dates via DateRangePicker
2. Calcul `checkIn` et `nights` automatique
3. Appel `useHyperGuestAvailability` avec `hyperguest_property_id`
4. Affichage chambres via RoomOptionsV2
5. User selectionne chambre/rate plan
6. Calcul prix via `useExperience2Price`
7. Affichage breakdown via PriceBreakdownV2

**Props:**
```typescript
interface BookingPanel2Props {
  experienceId: string;
  hotelId: string;
  hyperguestPropertyId: string | null;
  currency?: string;
  minParty?: number;
  maxParty?: number;
}
```

---

### 7. Page `Experience2.tsx`

**Structure identique a Experience.tsx V1:**
- Header/Footer
- HeroSection (reutilise)
- Layout 65/35 (contenu / booking panel sticky)
- ProgramTimeline, YourStaySection, LocationMap (reutilises)
- StickyPriceBar mobile avec Sheet pour BookingPanel2

**Differences avec V1:**
- Query sur `experiences2` au lieu de `experiences`
- Relations avec `hotels2` au lieu de `hotels`
- BookingPanel2 au lieu de BookingPanel
- Recuperation `hyperguest_property_id` de hotels2

**Gestion erreur HyperGuest manquant:**
```typescript
if (!hotel?.hyperguest_property_id) {
  return <ErrorMessage>
    Cette experience n'est pas disponible a la reservation
  </ErrorMessage>
}
```

---

### 8. Modification App.tsx

**Ajout de la route:**
```typescript
import Experience2 from './pages/Experience2';

// Dans Routes
<Route path="/experience2/:slug" element={<Experience2 />} />
```

---

## Composants Reutilises (aucune modification)

| Composant | Utilisation |
|-----------|-------------|
| `HeroSection` | Hero avec galerie photos |
| `ProgramTimeline` | "What's on the program" |
| `YourStaySection` | Section hotel |
| `LocationMap` | Carte Leaflet |
| `ReviewsGrid` | Grille des avis |
| `PracticalInfo` | Infos pratiques |
| `StickyPriceBar` | Barre mobile sticky |
| `DateRangePicker` | Selection des dates |

---

## Hooks Existants Reutilises

| Hook | Utilisation |
|------|-------------|
| `useExperienceAddons` | Recuperer les addons d'une experience |
| `useLanguage` | Gestion i18n (en/he/fr) |

---

## Dependances Techniques

**Composants shadcn/ui necessaires (deja installes):**
- Card, CardContent, CardHeader, CardTitle
- Separator
- RadioGroup, RadioGroupItem
- Label
- Badge
- Skeleton
- Sheet, SheetContent

---

## Considerations Importantes

### Gestion des erreurs

1. **Pas de `hyperguest_property_id`:** Message explicatif
2. **Aucune chambre disponible:** Message "Aucune disponibilite pour ces dates"
3. **Erreur API HyperGuest:** Toast d'erreur + fallback

### Performance

- `staleTime: 2 minutes` pour les disponibilites (prix volatils)
- `staleTime: 5 minutes` pour les experiences et addons
- Auto-selection de la premiere chambre/rate plan

### Calcul des prix

- Addons tries par `calculation_order`
- Commissions (ordre 0) appliquees sur base HyperGuest
- Taxes (ordre 1+) appliquees sur subtotal cumule
- Support `is_percentage` et valeurs fixes
- Support `per_night` (x nombre de nuits)

---

## Prochaines Etapes (hors scope)

1. **Logique de reservation:** Creer booking HyperGuest + enregistrement local
2. **Experience includes V2:** Table `experience2_includes` si necessaire
3. **Reviews V2:** Table `experience2_reviews` si necessaire
