# Responsive Premium -- Section "More experiences" + Footer mobile

## Problemes identifies

1. **8 categories en grille 2x2** = 4 rangees de carres, trop de scroll vertical sur mobile
2. **Email input** pleine largeur avec gros bouton "Notify me" — pas esthetique, trop imposant
3. Le tout manque de raffinement premium sur petit ecran

## Solution

### 1. Categories : scroll horizontal sur mobile (< md)

Remplacer la grille 2 colonnes par un **carousel horizontal sur 2 lignes avec snap** sur mobile :

- Les cartes deviennent rectangulaires (aspect-[3/4] au lieu de aspect-square) et plus petites (~140px de large)
- On voit ~2.5 x 2 cartes a la fois, ce qui invite naturellement a slider
- Snap sur chaque carte (`snap-x snap-mandatory` + `snap-start` sur chaque item)
- Masquer la scrollbar (`scrollbar-hide`)
- Sur tablette (md) et desktop : garder la grille 4 colonnes actuelle, rien ne change

### 2. Email capture : design compact et elegant sur mobile

Remplacer le layout actuel (texte + input pleine largeur + bouton) par un design plus raffine :

- Texte "Be the first to know." et input sur une seule ligne plus compacte
- Input avec placeholder + bouton integre (inline), largeur limitee a `max-w-sm`
- Reduire les marges entre le titre et le formulaire

### 3. Footer mobile : plus compact

Le footer mobile est correct mais un peu long. Fusionner les sections "STAYMAKOM" (links) et "Explore" en une seule rangee horizontale pour reduire la hauteur.

## Fichiers modifies

- `src/pages/LaunchIndex.tsx` — section 6 : categories en scroll horizontal mobile + email compact
- `src/components/LaunchFooter.tsx` — section mobile : fusionner les blocs de liens
- `src/index.css` — ajouter la classe utilitaire `scrollbar-hide` si elle n'existe pas deja

## Detail technique

### LaunchIndex.tsx — Section categories (lignes ~395-431)

Sur mobile (< md), remplacer la grille par :

```text
<div className="overflow-x-auto snap-x snap-mandatory scrollbar-hide flex gap-3 md:hidden pb-2">
  {categories.map(...) => 
    <div className="snap-start shrink-0 w-[140px]">
      <div className="aspect-[3/4] rounded-xl overflow-hidden ...">
        ...
      </div>
    </div>
  }
</div>
<div className="hidden md:grid grid-cols-4 gap-4">
  {/* grille desktop inchangee */}
</div>
```

### LaunchIndex.tsx — Section email (lignes ~368-393)

Rendre le formulaire plus compact sur mobile :

- Reduire le `mb-10` a `mb-6`
- Input plus petit avec `h-9 text-sm`

### LaunchFooter.tsx — Mobile

Fusionner les 2 blocs de liens (STAYMAKOM + Explore) en une seule rangee flex avec 2 colonnes cote a cote, reduisant la hauteur du footer de ~30%.