

# Page de lancement simplifiee -- `/launch`

Nouvelle page accessible sur `/launch`, ta page d'accueil actuelle reste intacte sur `/`.

## Ce qui sera cree

### 1 nouveau fichier : `src/pages/LaunchIndex.tsx`

Une page defilante unique avec ces sections :

**Section 1 -- Hero plein ecran**
- Image de fond (reutilisation de `hero-image-new.jpg` ou `desert-hero.jpg`)
- Titre : "Handpicked hotels. Unforgettable experiences." / version HE
- Sous-titre : "We curate Israel's best boutique hotels and pair them with unique local experiences."
- Un CTA "Explore experiences" qui scroll vers la grille

**Section 2 -- Grille d'experiences**
- Titre "Our Experiences"
- Query sur `experiences2` avec statut `published` + jointure `hotels2`
- Reutilisation du composant `ExperienceCard` existant avec `linkPrefix="/experience2"`
- Grille responsive : 1 col mobile, 2 col tablette, 3 col desktop
- Pas de filtre categorie, tout est visible d'un coup

**Section 3 -- Bandeau "How it works"**
- Reutilisation du composant `HowItWorksBanner` existant

**Section 4 -- Coming Soon + Lead capture**
- Message : "More experiences are on the way"
- Champ email simple + bouton "Notify me"
- Appel a l'edge function `collect-lead` avec `source: 'coming_soon'` (deja supporte)

**Section 5 -- Footer**
- Reutilisation du `Footer` existant

### 1 modification mineure : `src/App.tsx`

- Ajout d'une route `/launch` pointant vers `LaunchIndex`
- La route `/` reste sur `Index` -- rien ne change

## Ce qui ne change PAS
- Page Index.tsx actuelle : intacte
- Aucun composant existant modifie
- Aucune migration de base de donnees
- Header et Footer reutilises tels quels

## Details techniques

- Le composant utilise `useQuery` pour fetcher les `experiences2` publiees avec `hotels2` en jointure
- Support multilingue via `useLanguage` + `getLocalizedField` (pattern existant)
- Le formulaire email appelle `supabase.functions.invoke('collect-lead', ...)` avec le source `coming_soon`
- SEOHead pour les meta tags
- Scroll smooth vers la grille au clic sur le CTA hero

Quand tu seras pret a en faire ta page d'accueil, il suffira de changer la route `/` dans App.tsx.

