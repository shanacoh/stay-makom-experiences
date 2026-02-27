

# Auto-propager les infos hotel HyperGuest vers Things to Know

## Contexte
Actuellement, le `PracticalInfoManager` construit les items par défaut à partir des champs de l'expérience (`checkin_time`, `address`, etc.), mais ne récupère **pas** les données enrichies du hotel HyperGuest (`check_in_time`, `check_out_time`, `cancellation_policy`, `hyperguest_facilities`, `star_rating`, `min_stay`, `max_stay`, etc.).

## Plan

### 1. Enrichir PracticalInfoManager avec les données hotel

**`src/components/admin/PracticalInfoManager.tsx`** :
- Ajouter une prop optionnelle `hotelId` (le primary hotel de l'expérience)
- Fetch le record `hotels2` correspondant pour récupérer : `check_in_time`, `check_out_time`, `cancellation_policy`, `property_type`, `star_rating`, `hyperguest_facilities`, `min_stay`, `max_stay`, `max_child_age`
- Enrichir `buildDefaultItems` : si l'expérience n'a pas `checkin_time`/`checkout_time` mais que le hotel les a, utiliser ceux du hotel
- Ajouter de nouveaux items par défaut issus du hotel : facilities principales, min/max stay, child policy

### 2. Passer le hotelId depuis le formulaire

**`src/components/forms/UnifiedExperience2Form.tsx`** :
- Passer le `primaryHotelId` (premier hotel du parcours) au `PracticalInfoManager`

### 3. Logique de fusion

Quand aucun item DB n'existe (première ouverture) :
1. Items expérience (group size, duration, address, etc.) — comme aujourd'hui
2. Items hotel (check-in/out du hotel si pas dans l'expérience, facilities, child policy, min stay)
3. Tous visibles par défaut, l'admin peut ensuite toggle on/off et sauvegarder

Si des items DB existent déjà → pas de changement, on affiche ceux sauvegardés.

Pas de migration DB nécessaire — la table `experience2_practical_info` existe déjà avec les bonnes colonnes.

