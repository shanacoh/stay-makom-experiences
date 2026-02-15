
# Booking V2 : Dates predefinies + Calendrier libre

## Objectif
Ajouter au `BookingPanel2` un systeme hybride de selection de dates : des choix de dates predefinis (comme le V1) en plus du calendrier libre existant.

## Ce qui existe deja
- **V1 (`BookingPanel`)** : Selection de duree (1/2/3 nuits) puis liste de dates predefinis avec prix et reductions en radio buttons
- **V2 (`BookingPanel2`)** : Calendrier libre (`DateRangePicker`) avec integration HyperGuest pour les prix en temps reel

## Plan d'implementation

### Etape 1 : Creer la table `experience2_date_options`
Migration SQL pour stocker les dates predefinis par experience :
- `id` (uuid, PK)
- `experience_id` (FK vers experiences2)
- `checkin` (date)
- `checkout` (date)
- `label` / `label_he` (texte optionnel, ex: "Weekend special")
- `price_override` (numeric, optionnel - prix affiche)
- `original_price` (numeric, optionnel - prix barre)
- `discount_percent` (integer, optionnel)
- `featured` (boolean, default false - badge "Only X left")
- `is_active` (boolean, default true)
- `order_index` (integer, default 0)
- RLS : lecture publique, ecriture admin

### Etape 2 : Admin - Gestionnaire de dates predefinis
Creer `DateOptionsManager.tsx` dans `src/components/admin/` :
- Interface pour ajouter/supprimer des dates predefinis
- Champs : checkin, checkout, prix, prix original, reduction, featured, label
- Integre dans `UnifiedExperience2Form.tsx` dans la section Booking/Pricing

### Etape 3 : Modifier `BookingPanel2.tsx` - Mode hybride
Ajouter un systeme a deux onglets ou deux modes :
1. **"Suggested dates"** : Liste de dates predefinis en radio buttons (style V1) - recuperes depuis `experience2_date_options`
2. **"Choose your dates"** : Le calendrier libre existant (`DateRangePicker`)

Comportement :
- Si des dates predefinis existent, elles s'affichent en premier (mode par defaut)
- Un lien/bouton "Or pick your own dates" bascule vers le calendrier libre
- Dans les deux cas, une fois les dates selectionnees, le flux continue normalement (choix de chambre via HyperGuest, extras, etc.)
- Si aucune date predefinie n'existe, seul le calendrier libre est affiche

## Details techniques

### Structure du composant modifie (BookingPanel2)
```text
+----------------------------------+
|  Book this experience            |
+----------------------------------+
|  Number of guests   [- 2 +]     |
+----------------------------------+
|  [Suggested dates] [Pick dates]  |  <-- Tabs ou toggle
+----------------------------------+
|  Mode 1: Radio buttons           |
|  o Sat 22 Feb -> Mon 24 Feb      |
|    299EUR  -20%  [Only 2 left]   |
|  o Wed 26 Feb -> Fri 28 Feb      |
|    349EUR  -15%                   |
|  ...                             |
|  "Or choose your own dates v"    |
+----------------------------------+
|  Mode 2: DateRangePicker         |
|  [  Check-in  ] [  Check-out  ]  |
+----------------------------------+
|  Israeli resident toggle         |
+----------------------------------+
|  Room selection (HyperGuest)     |
|  Price breakdown                 |
|  [    Book - 599 EUR    ]        |
+----------------------------------+
```

### Fichiers concernes
- **Nouveau** : `supabase/migrations/xxx_experience2_date_options.sql`
- **Nouveau** : `src/components/admin/DateOptionsManager.tsx`
- **Modifie** : `src/components/forms/UnifiedExperience2Form.tsx` (ajout DateOptionsManager)
- **Modifie** : `src/components/experience/BookingPanel2.tsx` (mode hybride)
