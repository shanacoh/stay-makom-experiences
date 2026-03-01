
# HowItWorksBanner -- Texte sur deux lignes sur mobile/tablette

## Probleme
Sur mobile, le texte des 3 etapes ("Choose your vibe", "Pick your experience", "Book your hotel") est tronque ou trop serre a cause du `whitespace-nowrap` et de la petite taille. L'utilisateur veut voir l'integralite du texte en cassant chaque etape sur deux lignes : le numero + premier mot sur la ligne 1, le reste sur la ligne 2.

## Solution
Modifier `src/components/HowItWorksBanner.tsx` pour couper le texte de chaque etape apres le premier mot sur les ecrans mobiles/tablettes (en dessous de `sm`).

### Changements dans `HowItWorksBanner.tsx`

1. **Separer le texte en deux parties** dans les donnees : premier mot (`line1`) et le reste (`line2`)
   - "Choose" / "your vibe"
   - "Pick" / "your experience"  
   - "Book" / "your hotel"
   - Hebrew : "בחר" / "את האווירה", "בחר" / "את החוויה", "הזמן" / "את המלון"

2. **Affichage mobile (< sm)** : le texte s'affiche sur deux lignes via un `flex flex-col` ou un `<br />` masque sur desktop
   - Retirer le `whitespace-nowrap` sur mobile
   - Garder `whitespace-nowrap` sur `sm:` et plus

3. **Affichage desktop (>= sm)** : rien ne change, tout reste sur une seule ligne comme aujourd'hui

### Rendu attendu sur mobile
```text
1  Choose        2  Pick           3  Book
   your vibe        your experience   your hotel
```

### Aucun autre fichier modifie
Seul `src/components/HowItWorksBanner.tsx` est touche. Pas de changement de couleurs, padding global, ni de la structure `section > container > flex`.
