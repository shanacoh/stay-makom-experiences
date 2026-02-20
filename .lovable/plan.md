

# Fusion sections "More experiences" + "Coming soon" -- version compacte

## Concept

Une seule section avec fond `bg-muted/50`, sans separateur, et le haut (titre + email) condense sur le minimum de lignes possible.

## Rendu visuel

```text
┌──────────────────────────────────────────────────┐
│              (fond beige unifie bg-muted/50)      │
│                                                   │
│  MORE EXPERIENCES ARE ON THE WAY.                 │
│  Be the first to know.  [email______] [NOTIFY ME]│
│                                                   │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                 │
│  │ ROM │ │ FAM │ │ SPO │ │ NAT │                  │
│  └─────┘ └─────┘ └─────┘ └─────┘                 │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                 │
│  │ FOO │ │ MIN │ │ WOR │ │ GOL │                  │
│  └─────┘ └─────┘ └─────┘ └─────┘                 │
│                                                   │
└──────────────────────────────────────────────────┘
```

Le titre, le sous-titre et le formulaire email sont condenses sur **2 lignes max** en desktop (titre sur une ligne, sous-titre + formulaire sur la meme ligne). En mobile, ca passe sur 3 lignes naturellement.

## Changements techniques

Fichier : `src/pages/LaunchIndex.tsx`

### 1. Fusionner les sections 7 et 8 en une seule `<section>`
- Supprimer le `</section>` de la section 7 et le `<section>` de la section 8
- Un seul wrapper `<section className="py-12 sm:py-16 bg-muted/50">`

### 2. Condenser le haut (titre + email) sur le minimum de place
- Titre en une seule ligne : `text-xl sm:text-2xl md:text-3xl` avec `mb-3` seulement
- Sous-titre et formulaire email sur la meme ligne en desktop via `flex` :
  - Sur mobile : sous-titre au-dessus, formulaire en dessous (flex-col)
  - Sur tablette+ : sous-titre a gauche, formulaire a droite (flex-row items-center)
- Reduire le `max-w` du conteneur haut a `max-w-2xl` pour que tout soit compact

### 3. Grille de categories juste en dessous
- `mt-10` entre le formulaire et la grille (pas de separateur)
- Supprimer le titre "Coming soon" (redondant)
- Garder la grille `grid-cols-2 md:grid-cols-4` existante

### 4. Pas de separateur
- Aucune ligne, aucun border-t -- juste de l'espace naturel entre le formulaire et les cartes

