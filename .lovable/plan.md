

## Analyse du Hero Mobile — État actuel & Améliorations UX/UI

### État actuel (390×844)

| Élément | Taille actuelle | Observation |
|---------|----------------|-------------|
| H1 titre | `text-3xl` (30px), bold, uppercase | Très imposant, bon impact mais prend beaucoup de place verticale |
| Sous-titre | `text-base` (16px), italic, white/90 | Un peu petit par rapport au titre — manque de hiérarchie claire |
| CTA bouton | `text-sm` (14px), `px-10 py-4` | Texte trop petit pour un CTA principal ; bon padding mais le label se perd |
| Hero hauteur | `62vh` (~520px sur iPhone 13) | Correct mais le contenu flotte un peu haut |
| Overlay | `bg-black/45` | Un poil lourd, réduit la qualité visuelle de la photo |

### Améliorations proposées

1. **Agrandir le sous-titre** — passer de `text-base` (16px) à `text-lg` (18px) sur mobile pour mieux compléter le H1 et renforcer la hiérarchie visuelle.

2. **Agrandir le texte du CTA** — passer de `text-sm` (14px) à `text-base` (16px) avec un tracking un peu plus large. Le bouton est le seul call-to-action visible : il doit être lisible et impactant au premier regard.

3. **Réduire légèrement l'overlay** — de `bg-black/45` à `bg-black/35` pour laisser la photo respirer davantage tout en gardant la lisibilité du texte blanc.

4. **Ajuster l'espacement** — réduire le `mb-7` sous le sous-titre à `mb-6` et augmenter le `mb-4` sous le H1 à `mb-5` pour un rythme vertical plus équilibré entre titre → sous-titre → bouton.

5. **Ajuster la hauteur hero mobile** — passer de `62vh` à `60vh` pour laisser entrevoir légèrement le contenu sous le fold (le bandeau "How it works"), ce qui incite au scroll — un pattern UX éprouvé.

### Fichier touché
- `src/pages/LaunchIndex.tsx` — section Hero uniquement (lignes ~234-265)

### Résumé des changements CSS

```text
Avant                          →  Après
─────────────────────────────────────────────
H1 mb-4                        →  mb-5
Subtitle text-base              →  text-lg (mobile)
Subtitle mb-7                   →  mb-6
CTA text-sm                     →  text-base
Overlay bg-black/45             →  bg-black/35
Hero h-[62vh]                   →  h-[60vh]
```

Tous les changements sont subtils et ciblés — pas de restructuration, juste un meilleur calibrage typographique et d'espacement pour un hero mobile plus premium.

