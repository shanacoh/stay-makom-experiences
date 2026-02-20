

# Refonte de la page `/launch` -- Alignement sur l'ADN visuel de la homepage

## Probleme actuel

La page `/launch` a ete creee "from scratch" avec un hero generique (serif, fond plein, bouton pill) qui ne correspond pas du tout au style de la homepage actuelle : typographie sans-serif bold uppercase, hero avec texte rotatif, bandeau marquee, categories visuelles, sections sombres avec images.

## Ce qui va changer

La page `LaunchIndex.tsx` sera entierement reecrite pour reprendre les composants et le style exact de la homepage, en ne gardant que les sections pertinentes pour le lancement.

## Structure de la nouvelle page `/launch`

```text
+-----------------------------------------------+
| HEADER (existant, inchange)                   |
+-----------------------------------------------+
| HERO (meme style que Index.tsx)               |
| - Image de fond: hero-image-new.jpg           |
| - Titre uppercase bold: "MORE THAN A STAY,    |
|   IT'S A [RotatingText categories]"           |
| - CTA blanc: "FIND YOUR EXPERIENCE + HOTEL"  |
|   scrolle vers la grille                      |
+-----------------------------------------------+
| HOW IT WORKS BANNER (composant existant)      |
+-----------------------------------------------+
| SECTION "DON'T CHOOSE A CITY"                 |
| - Titre + sous-titre (meme texte/style)       |
| - Grille de categories (CategoryCard)         |
|   seulement celles qui ont des experiences    |
|   publiees dans experiences2                  |
+-----------------------------------------------+
| MARQUEE BANNER (composant existant)           |
+-----------------------------------------------+
| SECTION HANDPICKED HOTELS (hero sombre)       |
| - Image: handpicked-hero.jpg                  |
| - Texte descriptif sur fond sombre            |
+-----------------------------------------------+
| SECTION EXPERIENCES2 (grille)                 |
| - Titre "New Experiences" / "View all"        |
| - Grille des experiences2 publiees            |
| - ExperienceCard avec linkPrefix="/experience2"|
+-----------------------------------------------+
| GIFT CARD SECTION (meme style que homepage)   |
| - Image + texte + CTA "Send a gift card"      |
+-----------------------------------------------+
| COMING SOON + LEAD CAPTURE                    |
| - "More experiences are on the way"           |
| - Email input + "Notify me"                   |
| - Appel edge function collect-lead            |
+-----------------------------------------------+
| CATEGORIES GRID (pleine largeur)              |
| - Toutes les categories publiees              |
| - Meme composant CategoryCard                 |
+-----------------------------------------------+
| FOOTER (existant, inchange)                   |
+-----------------------------------------------+
```

## Sections retirees vs homepage

- Section "Who STAYMAKOM is for" (cards frosted glass) : retiree
- V1 Experiences carousels et grilles : retires (on ne montre que V2)
- Category Tabs avec icones : retires (pas assez de contenu)
- AI Experience Assistant + StickyAIButton : retires
- Desert Kiosk Hero (partner CTA) : retire
- Journal section : retiree

## Sections conservees et copiees depuis la homepage

1. **Hero** -- Meme image (`hero-image-new.jpg`), meme overlay `bg-black/30`, meme typographie `font-sans uppercase bold`, meme `RotatingText` avec les noms de categories, meme CTA blanc rectangulaire
2. **HowItWorksBanner** -- Import direct du composant existant
3. **Categories "Choose your escape"** -- Meme titre, meme sous-titre, meme grille `CategoryCard` 
4. **MarqueeBanner** -- Import direct
5. **Handpicked Hotels hero** -- Meme image `handpicked-hero.jpg`, meme texte, meme overlay sombre
6. **Experiences2 grid** -- Reprend le pattern `Experiences2HomeSection` de Index.tsx mais sans limite de 4 (affiche tout)
7. **Gift Card section** -- Meme layout image + texte + CTA
8. **Coming Soon + Lead capture** -- Garde le formulaire email existant mais avec le style de la homepage (font-sans, pas serif)
9. **Categories grid plein** -- La grille 4x2 de categories en bas (visible dans la capture d'ecran)

## Ameliorations UX/UI proposees

1. **Grille experiences responsive** : adopter le meme pattern que la homepage (4 colonnes desktop, carousel mobile avec snap scroll) au lieu de la grille statique 3 colonnes actuelle
2. **Categories filtrables** : les CategoryCard en bas pourraient etre cliquables vers `/category/[slug]` comme sur la homepage
3. **Lead capture integre** : deplacer le formulaire email dans la section "More experiences are on the way" juste au-dessus de la grille de categories, comme sur la capture d'ecran
4. **Typographie unifiee** : tout en `font-sans` (Inter) avec `tracking-[-0.02em]`, pas de `font-serif`
5. **CTA style unifie** : boutons blancs rectangulaires (`rounded-none` ou `rounded-md`) comme sur la homepage, pas de boutons pill

## Details techniques

### Fichier modifie : `src/pages/LaunchIndex.tsx`

Reecrit pour importer et utiliser :
- `heroImage` depuis `@/assets/hero-image-new.jpg`
- `handpickedHero` depuis `@/assets/handpicked-hero.jpg`
- `giftCardHero` depuis `@/assets/gift-card-hero.jpg`
- `RotatingText` composant
- `CategoryCard` composant
- `MarqueeBanner` composant
- `HowItWorksBanner` composant
- `ExperienceCard` composant
- Traductions via `t(lang, ...)` depuis `@/lib/translations`

### Queries Supabase

- Categories : `supabase.from("categories").select("*").eq("status", "published").order("display_order")`
- Experiences2 : `supabase.from("experiences2").select("*, experience2_hotels(position, nights, hotel:hotels2(...))").eq("status", "published")`

### Aucune modification de la homepage

`src/pages/Index.tsx` reste intacte. Seul `LaunchIndex.tsx` est modifie.

### Aucune migration de base de donnees
