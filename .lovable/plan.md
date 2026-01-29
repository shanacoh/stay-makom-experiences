
# Correction du Shimmer Effect - Plus Naturel et Précis

## Problème Identifié

Le shimmer se déclenche sur 2 cartes en même temps car :
1. Les cartes sont très proches (gap de 2-3)
2. Le pseudo-élément `::before` avec `inset: 0` peut créer des chevauchements visuels
3. La transition est trop "mécanique" - elle démarre immédiatement au hover

## Solution : Shimmer Plus Naturel et Isolé

### Approche

1. **Délai au hover** : Ajouter un léger délai (150ms) avant que le shimmer ne démarre pour éviter les déclenchements accidentels
2. **Containment CSS** : Ajouter `contain: layout` pour isoler chaque carte
3. **Animation plus organique** : Varier légèrement la vitesse et l'angle pour un effet moins "robot"
4. **Trigger plus précis** : S'assurer que le shimmer ne se déclenche que quand la souris est vraiment SUR la carte

---

## Modifications Techniques

### Fichier : `src/index.css`

```css
.category-card {
  position: relative;
  overflow: hidden;
  contain: layout;  /* Isole le rendu de chaque carte */
}

.category-card::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 10;
  width: 60%;
  height: 200%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.35) 50%,
    transparent 100%
  );
  transform: translateX(-150%) rotate(25deg);
  /* Transition avec délai de 100ms au départ */
  transition: transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) 0.1s;
  pointer-events: none;
  opacity: 0;
}

.category-card:hover::before {
  transform: translateX(250%) rotate(25deg);
  opacity: 1;
  /* Pas de délai à la sortie pour une transition fluide */
  transition: transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) 0.1s,
              opacity 0.1s ease-out;
}
```

### Points clés :

| Changement | Effet |
|------------|-------|
| `contain: layout` | Isole le rendu, empêche les interférences entre cartes |
| `transition-delay: 0.1s` | Évite les déclenchements parasites lors du passage rapide |
| `opacity: 0` → `1` | Le shimmer apparaît progressivement, plus naturel |
| Courbe `cubic-bezier(0.25, 0.1, 0.25, 1)` | Mouvement plus fluide et naturel |
| Opacité réduite à 0.35 | Reflet plus subtil, moins "effet spécial" |

---

## Résultat Attendu

- Le shimmer ne se déclenche que sur UNE seule carte à la fois
- Un court délai évite les "faux" hovers lors du déplacement de souris
- L'effet est plus doux et naturel (opacity fade-in + timing ajusté)
- Visuellement plus premium et moins "jeu vidéo"
