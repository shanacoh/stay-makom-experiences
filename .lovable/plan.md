

# Refonte du sélecteur de filtre -- Section 2 de `/launch`

## Ce qui change

### 1. Titre reformaté sur deux lignes distinctes
Le titre passe de "Handpicked hotels, unforgettable experiences." a deux lignes separees par un point :
```
Handpicked Hotels.
Unforgettable Experiences.
```
Typographie bold uppercase, grande taille, avec un espacement genereux.

### 2. Remplacement des grandes cartes image par un toggle compact

Les deux grosses cartes image (aspect ratio, overlay sombre, etc.) sont remplacees par un **toggle button inline** compact et elegant :

- Un conteneur horizontal avec fond `bg-muted/50` et `rounded-full`, type "pill selector"
- Deux boutons cote a cote :
  - **Feel adventurous** (a gauche)
  - **Romantic getaway** (a droite)
- Chaque bouton a une petite icone :
  - Feel adventurous : icone `Compass` (lucide)
  - Romantic getaway : icone `Heart` (lucide)
- Le bouton actif a un fond `bg-white` (ou `bg-primary` avec texte blanc), un `shadow-sm`, et `rounded-full`
- Le bouton inactif est transparent avec texte `text-muted-foreground`
- Transition smooth entre les etats (`transition-all duration-300`)
- Taille compacte : `h-10 px-5 text-sm`

### 3. Etat par defaut

`activeFilter` est initialise a `FILTER_ADVENTURE` ("active") au lieu de `null`, donc "Feel adventurous" est selectionne par defaut au chargement.

### 4. Sous-titre conserve

"For 24 hours, 48 hours, or tailor-made experiences." reste en place sous le titre.

### 5. Suppression du lien "Show all experiences"

Le bouton "Show all experiences" qui apparaissait sous les filtres est retire. L'utilisateur bascule simplement entre les deux options.

## Details techniques

### Fichier modifie : `src/pages/LaunchIndex.tsx`

- **Ligne 47** : Changer l'initialisation de `useState<string | null>(null)` a `useState<string | null>(FILTER_ADVENTURE)`
- **Lignes 206-288** : Remplacer toute la section filtre :
  - Nouveau titre en 2 lignes avec `<br />` ou deux `<span>` en block
  - Sous-titre inchange
  - Nouveau composant toggle inline : un `div` flex horizontal avec deux `button` stylises en pill, chacun avec icone Lucide + texte
  - Suppression du bouton "Show all experiences"
- Les images `romanticImg` et `activeImg` ne seront plus utilisees dans cette section (les imports peuvent rester pour usage futur)

### Rendu visuel attendu

```text
        Handpicked Hotels.
     Unforgettable Experiences.

  For 24 hours, 48 hours, or tailor-made.

  [ 🧭 Feel adventurous | ❤️ Romantic getaway ]
         (toggle compact pill)
```

Le toggle fait environ 350px de large, centre, avec des coins arrondis, et un indicateur visuel clair sur l'option active (fond blanc + ombre).

