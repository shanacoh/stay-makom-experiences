

## Problème identifié

**Bug critique** : quand on édite un hôtel existant, le `hyperguest_property_id` est **écrasé à `null`** à chaque sauvegarde.

**Cause racine** (ligne 381 de `HotelEditor2.tsx`) :
```tsx
hyperguest_property_id: hyperguestId ? String(hyperguestId) : null,
```

L'état `hyperguestId` est initialisé à `null` et n'est mis à jour que lorsqu'on importe un hôtel depuis HyperGuest (`handleHyperGuestSelect`). Lors de l'édition d'un hôtel existant, le `useEffect` qui charge les données (lignes 277-340) ne restaure jamais `hyperguestId` depuis `hotel.hyperguest_property_id`. Résultat : chaque fois qu'un admin édite et sauvegarde un hôtel, le lien HyperGuest est perdu.

## Plan de correction

### 1. Restaurer `hyperguestId` au chargement de l'hôtel existant
Dans le `useEffect` qui peuple `formData` depuis `hotel` (~ligne 278), ajouter :
```tsx
if (h.hyperguest_property_id) {
  setHyperguestId(Number(h.hyperguest_property_id));
}
```

### 2. Préserver la valeur existante lors de la sauvegarde
Modifier la logique de sauvegarde (ligne 381) pour ne pas écraser une valeur existante :
```tsx
hyperguest_property_id: hyperguestId
  ? String(hyperguestId)
  : (hotelId ? (hotel as any)?.hyperguest_property_id ?? null : null),
```

### 3. Afficher le statut HyperGuest dans l'éditeur (guidage léger)
Ajouter un petit indicateur visuel sous le bloc HyperGuest Search :
- **Si connecté** : badge vert "✓ Connected to HyperGuest (ID: XXXX)" 
- **Si non connecté** : badge orange "⚠ No HyperGuest connection — online booking will be unavailable"

Cela reste discret mais informe l'admin du statut sans modifier l'interface.

### 4. Avertissement au publish sans HyperGuest
Lors du changement de statut vers "published", si `hyperguestId` est null, afficher un toast d'avertissement (pas bloquant) :  
"This hotel has no HyperGuest connection. Experiences linked to it won't support online booking."

### Fichiers modifiés
- `src/pages/admin/HotelEditor2.tsx` — les 4 points ci-dessus

