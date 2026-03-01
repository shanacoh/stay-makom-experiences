

# Implémentation complète des Cancellation Policies HyperGuest

## Étape 1 — Créer `src/utils/cancellationPolicy.ts`

Fonction utilitaire `analyzeCancellationPolicies(policies, checkInDate, lang)` qui :
- Prend le tableau brut `cancellationPolicies[]` du JSON HyperGuest + date de check-in + langue
- Détecte `isNonRefundable` (daysBefore ≥ 999 + amount 100 + penaltyType "percent")
- Détecte `isFreeCancellation` (aucune pénalité > 0 applicable à la date actuelle)
- Calcule `effectiveDeadline` : checkInDate à `cancellationDeadlineHour` (HH:mm) - `timeFromCheckIn` (hours/days)
- Retourne `penalties[]` formatées et `summaryText` multilingue (en/fr/he)
- Gère les 3 penaltyType : "nights" → "X night(s)", "percent" → "X%", "currency" → "X [symbol]"

## Étape 2 — Mettre à jour `RoomOptionsV2.tsx`

- Importer `analyzeCancellationPolicies`
- Recevoir `checkInDate?: string` en prop (passé depuis BookingPanel2)
- Remplacer lignes 237-247 (la logique `cancellationPolicy?.type === "FREE_CANCELLATION"`) par :
  - Appel à `analyzeCancellationPolicies(ratePlan.cancellationPolicies || [], checkInDate)`
  - Badge vert si `isFreeCancellation` avec deadline
  - Badge rouge si `isNonRefundable`
  - Badge orange sinon avec `summaryText`
- Supprimer l'interface `CancellationPolicy` locale (lignes 15-22) devenue inutile

## Étape 3 — Afficher dans le récap de BookingPanel2

- Après la sélection de room/ratePlan et avant le bouton Book (vers ligne 774), ajouter une section affichant la politique d'annulation du rate plan sélectionné
- Utiliser `analyzeCancellationPolicies(selectedRatePlan?.cancellationPolicies, checkIn)`
- Afficher le `summaryText` complet avec icône appropriée (vert/rouge/orange)

## Étape 4 — Remplacer le texte hardcodé sur les cards

**`StickyPriceBar.tsx`** (ligne 70-72) et **`HeroBookingPreview.tsx`** (ligne 43-45) :
- Supprimer le texte "Free cancellation" / "ביטול חינם" / "Annulation gratuite" statique
- Ne rien afficher tant qu'aucune recherche n'a été faite (ces composants n'ont pas accès aux données de search — le texte est simplement retiré)

## Étape 5 — Email de confirmation

Dans `send-booking-confirmation/index.ts` :
- Ajouter un champ `cancellationPolicy` au body (objet `{ summaryText, isNonRefundable, deadline }`)
- Le frontend envoie ce champ dans l'appel `invoke` (BookingPanel2 ligne ~494)
- Ajouter un bloc HTML dans l'email entre le total et les remarks affichant la politique

## Étape 6 — Passer les données au BookingPanel2 → RoomOptionsV2

- BookingPanel2 passe `checkInDate={searchParams?.checkIn}` à `RoomOptionsV2`
- BookingPanel2 calcule aussi la cancellation du ratePlan sélectionné pour l'affichage récap et l'envoi email

### Fichiers modifiés
1. **Nouveau** : `src/utils/cancellationPolicy.ts`
2. `src/components/experience/RoomOptionsV2.tsx`
3. `src/components/experience/BookingPanel2.tsx`
4. `src/components/experience-test/StickyPriceBar.tsx`
5. `src/components/experience-test/HeroBookingPreview.tsx`
6. `supabase/functions/send-booking-confirmation/index.ts`

