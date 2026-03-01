

# HowItWorksBanner — Numero au-dessus, texte compact en dessous (mobile)

## Rendu attendu sur mobile

```text
     1              2              3
   Choose          Pick           Book
  your vibe    your experience   your hotel
```

Chaque etape est un bloc vertical centre : le chiffre en haut, puis le texte en dessous sur 1 ou 2 lignes naturelles. Les 3 blocs restent cote a cote, separes par le point.

Sur desktop (>= sm), rien ne change — tout reste sur une ligne horizontale comme aujourd'hui.

## Changement technique

**Fichier unique** : `src/components/HowItWorksBanner.tsx`

### Layout mobile (< sm)
- Le conteneur de chaque etape passe de `inline-flex items-start` a `flex flex-col items-center` sur mobile, puis revient a `sm:flex-row sm:items-center`
- Le chiffre est centre au-dessus du texte
- Le texte (line1 + line2) est affiche en un seul bloc centre, sans `<br>` force — il wrappera naturellement si besoin
- Taille du chiffre : `text-lg` sur mobile (un peu plus grand pour la hierarchie verticale), `sm:text-2xl` sur desktop
- Taille du texte : reste `text-[11px]` sur mobile, `sm:text-base` sur desktop
- Le padding vertical du bandeau reste `py-2.5` sur mobile — pas d'augmentation

### Desktop (>= sm)
- Aucun changement. Le layout horizontal actuel (numero + texte cote a cote) est preserve via les classes `sm:flex-row sm:items-center`

