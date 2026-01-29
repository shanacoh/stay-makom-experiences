
# Plan : Réduction et Harmonisation de la Section "Who STAYMAKOM is for"

## Problèmes Identifiés

| Élément | Actuel | Problème |
|---------|--------|----------|
| Padding section | `py-16 sm:py-20 md:py-24` | Beaucoup trop grand vs autres sections |
| Police titre | `font-serif text-3xl sm:text-4xl md:text-5xl` | Trop gros, mauvaise police |
| Icônes | `text-primary` (bleu foncé) sur fond sombre | Invisibles |
| Padding cartes | `p-6 md:p-8` | Trop espacé |
| Titres cartes | `text-xl md:text-2xl font-serif` | Trop gros, mauvaise police |

## Comparaison avec Sections Adjacentes

```text
Section Gift Card (après) : py-12 md:py-16, titre text-2xl md:text-3xl font-sans
Section Handpicked (avant): py-10 sm:py-14, titre text-xl sm:text-2xl md:text-3xl font-sans
Section Categories        : py-4 sm:py-6 md:py-8, titre text-lg sm:text-xl md:text-2xl lg:text-3xl
```

## Modifications Prévues

### Fichier : `src/pages/Index.tsx`

#### 1. Réduction du Padding Section
```
Avant : py-16 sm:py-20 md:py-24
Après : py-10 sm:py-12 md:py-14
```

#### 2. Titre avec Police INTER (font-sans)
```
Avant : font-serif text-3xl sm:text-4xl md:text-5xl
Après : font-sans text-xl sm:text-2xl md:text-3xl font-bold tracking-[-0.02em]
```

#### 3. Icônes Claires (Visibles)
```
Avant : bg-primary/20 + text-primary (foncé sur foncé)
Après : bg-white/20 + text-white (clair sur foncé)
```
Réduction taille icônes : `w-10 h-10` au lieu de `w-12 h-12`

#### 4. Cartes Plus Compactes
```
Avant : p-6 md:p-8, gap-6 md:gap-8
Après : p-4 md:p-5, gap-4 md:gap-5
```

#### 5. Titres Cartes Plus Petits
```
Avant : font-serif text-xl md:text-2xl
Après : font-sans text-base md:text-lg font-semibold
```

#### 6. Descriptions Plus Petites
```
Avant : text-sm md:text-base
Après : text-xs md:text-sm
```

#### 7. Margins Ajustés
```
Avant : mb-12 md:mb-16 (titre)
Après : mb-6 md:mb-8
```

---

## Résultat Visuel Attendu

```text
┌────────────────────────────────────────────────────────────┐
│                     SECTION PRÉCÉDENTE                     │
│              (Visible en haut de l'écran)                  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│         Who STAYMAKOM is for                               │  ← font-sans, plus petit
│                                                            │
│   ┌─────────┐   ┌─────────┐   ┌─────────┐                 │
│   │ ○ icon  │   │ ○ icon  │   │ ○ icon  │  ← icônes blanches
│   │ Titre   │   │ Titre   │   │ Titre   │  ← plus compact
│   │ desc... │   │ desc... │   │ desc... │                  │
│   └─────────┘   └─────────┘   └─────────┘                 │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                     SECTION SUIVANTE                       │
│              (Visible en bas de l'écran)                   │
└────────────────────────────────────────────────────────────┘
```

---

## Tableau Récapitulatif des Changements

| Élément | Avant | Après |
|---------|-------|-------|
| Padding section | `py-16 sm:py-20 md:py-24` | `py-10 sm:py-12 md:py-14` |
| Police titre | `font-serif` | `font-sans` |
| Taille titre | `text-3xl sm:text-4xl md:text-5xl` | `text-xl sm:text-2xl md:text-3xl` |
| Margin titre | `mb-12 md:mb-16` | `mb-6 md:mb-8` |
| Couleur icônes | `text-primary` + `bg-primary/20` | `text-white` + `bg-white/20` |
| Taille cercle icône | `w-12 h-12` | `w-10 h-10` |
| Padding cartes | `p-6 md:p-8` | `p-4 md:p-5` |
| Gap grille | `gap-6 md:gap-8` | `gap-4 md:gap-5` |
| Titres cartes | `font-serif text-xl md:text-2xl` | `font-sans text-base md:text-lg font-semibold` |
| Descriptions | `text-sm md:text-base` | `text-xs md:text-sm` |
| Margin titres cartes | `mb-3` | `mb-2` |
| Margin icônes | `mb-5` | `mb-3` |

