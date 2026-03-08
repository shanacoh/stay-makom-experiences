

## Plan: Launch Universe — Pages d'expériences et navigation cohérente

### Problème actuel
Les liens depuis la page `/launch` (menu hamburger, cartes d'expériences, footer) renvoient vers des pages qui utilisent le Header/Footer classique, ce qui casse l'univers launch. De plus, il manque une page dédiée "Feeling Adventurous".

### Architecture proposée

**Approche : Paramètre `?context=launch` propagé via les URLs**

Plutôt que de dupliquer toutes les pages, on utilise un query param `context=launch` pour indiquer qu'on est dans l'univers launch. Les composants Experience2 et la future page de listing détectent ce param et swappent Header/Footer pour LaunchHeader/LaunchFooter.

### Changements

**1. Créer une page `/launch/experiences` (listing filtré)**
- Nouvelle page `src/pages/LaunchExperiences.tsx` qui affiche les expériences V2 filtrées par catégorie (`?filter=romantic` ou `?filter=adventure`)
- Utilise LaunchHeader + LaunchFooter
- Toggle "Feel Adventurous" / "Romantic Escape" comme sur LaunchIndex
- Titre adapté au filtre actif
- Les cartes d'expérience linkent vers `/experience/:slug?context=launch`

**2. Modifier Experience2.tsx pour supporter le contexte launch**
- Détecter `?context=launch` dans l'URL
- Si présent : afficher LaunchHeader + LaunchFooter au lieu de Header + Footer
- S'assurer que les liens internes (autres expériences, etc.) propagent `context=launch`

**3. Mettre à jour les liens dans l'univers launch**
- `LaunchIndex.tsx` : les cartes d'expérience linkent vers `/experience/:slug?context=launch` (au lieu de `/experience2/:slug`)
- `LaunchHamburgerMenu.tsx` :
  - "Feel Adventurous" → `/launch/experiences?filter=adventure`
  - "Romantic Escape" → `/launch/experiences?filter=romantic`
  - "Home" remplacé par un lien vers `/launch`
  - About → `/about?context=launch`
  - Contact → `/contact?context=launch`
- `LaunchHeader.tsx` : logo STAYMAKOM linke vers `/launch` (pas `/`)
- `LaunchFooter.tsx` : liens "Explore" pointent vers `/launch/experiences?filter=adventure` et `?filter=romantic`

**4. Route dans App.tsx**
- Ajouter `<Route path="/launch/experiences" element={<LaunchExperiences />} />`

**5. Propagation du contexte**
- Créer un petit hook `useLaunchContext()` qui lit `context=launch` depuis l'URL et expose une fonction helper pour ajouter ce param aux liens
- L'utiliser dans ExperienceCard quand `linkPrefix` inclut le contexte launch

### Fichiers impactés
- `src/pages/LaunchExperiences.tsx` — nouveau
- `src/hooks/useLaunchContext.ts` — nouveau (petit helper)
- `src/pages/Experience2.tsx` — swap Header/Footer conditionnellement
- `src/pages/LaunchIndex.tsx` — update linkPrefix
- `src/components/LaunchHamburgerMenu.tsx` — update liens
- `src/components/LaunchHeader.tsx` — logo → `/launch`
- `src/components/LaunchFooter.tsx` — update liens explore
- `src/App.tsx` — nouvelle route

