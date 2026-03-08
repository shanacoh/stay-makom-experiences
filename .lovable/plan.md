
Objectif
- Corriger définitivement le sticky des catégories sur mobile (plus de chevauchement avec le logo, plus de disparition pendant le scroll).

Diagnostic (cause racine)
1) Le bloc sticky des catégories est actuellement placé dans un conteneur trop court (`.text-center ...` autour du titre).  
   - En CSS, un élément `position: sticky` ne reste sticky que dans les limites de son parent.  
   - Résultat: il “décroche” trop tôt et semble disparaître pendant le scroll.

2) Le `top` sticky est hardcodé (`top-[44px]`) alors que la hauteur réelle du header mobile n’est pas stable (line-height global + padding).  
   - Résultat: le logo peut recouvrir la nav catégories selon l’état de scroll/device.

3) La logique JS (IntersectionObserver + `tabsSticky`) utilise un offset différent (`rootMargin -36`) qui n’est pas aligné avec `top 44`.  
   - Résultat: comportement visuel incohérent (états sticky/non-sticky décalés).

Plan de correction
1) Re-structurer `LaunchIndex` pour que le bloc catégories sticky ne soit plus dans le wrapper du titre.
- Garder titre/sous-titre dans un bloc statique.
- Déplacer la barre catégories sticky comme sibling direct dans la section `#launch-experiences`, juste avant la grille.
- Ainsi, son parent sticky devient la section complète (titre + grille), donc la nav reste bien visible pendant le scroll de la grille.

2) Unifier l’offset header mobile (source unique).
- Créer une constante partagée (ex: `MOBILE_LAUNCH_HEADER_HEIGHT`).
- L’utiliser:
  - dans `MobileStickyHeader` pour fixer une hauteur explicite,
  - dans `LaunchIndex` pour la valeur `top` sticky (via `style={{ top: ... }}`),
  - dans l’observer si on garde l’effet d’état visuel.
- Supprimer la dépendance à un `top-[44px]` magique.

3) Stabiliser la hauteur réelle du header mobile.
- Dans `MobileStickyHeader`:
  - remplacer `py-2` par une hauteur explicite (`h-*`) + `items-center`,
  - forcer `leading-none` (ou `leading-tight`) sur le logo pour éviter l’inflation de hauteur due au line-height global.
- But: header toujours identique, toutes tailles mobile.

4) Simplifier la logique sticky (robustesse).
- Option robuste recommandée: garder le sticky pure CSS et limiter JS au strict minimum.
- Si `tabsSticky` est conservé uniquement pour style (fond/border), aligner son seuil avec la même constante d’offset.
- Éliminer tout mismatch entre `rootMargin` et `top`.

5) Ajuster l’ancre de scroll.
- Augmenter `scroll-mt-*` de `#launch-experiences` pour tenir compte du header + tabs sticky sur mobile.
- Évite l’impression “caché sous le logo” après `scrollIntoView`.

Détails techniques (fichiers touchés)
- `src/pages/LaunchIndex.tsx`
  - déplacer le bloc sticky catégories hors du wrapper titre,
  - appliquer `top` via constante partagée,
  - aligner/simplifier observer sticky,
  - ajuster `scroll-mt`.
- `src/components/MobileStickyHeader.tsx`
  - hauteur explicite et line-height contrôlé,
  - conserver design actuel (même rendu visuel) mais dimensions prévisibles.
- (optionnel) `src/constants/layout.ts`
  - exporter la constante commune d’offset mobile.

Validation (à faire après implémentation)
1) Mobile 390x844 et 375x812: scroll bas/haut long.
2) Vérifier que la barre catégories:
   - reste visible en sticky pendant le scroll de la grille,
   - ne passe jamais sous le logo,
   - ne chevauche pas les cards.
3) Tester changement de filtre + recalcul underline.
4) Tester EN/HE (texte plus long) pour confirmer absence de recouvrement.
