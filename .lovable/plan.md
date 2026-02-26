
# Remettre la page Coming Soon + corriger le favicon

## Ce qui sera fait

### 1. Favicon — supprimer le doublon
Le fichier `index.html` contient deux lignes `<link rel="icon">`. On supprime l'ancienne (ligne 4) et on garde la nouvelle (ligne 5) qui pointe vers le bon `favicon.png`.

### 2. Route `/` → Coming Soon
Dans `src/App.tsx`, on change la route principale pour que :
- `/` affiche `ComingSoon` (ce que les visiteurs voient sur staymakom.com)
- `/home` affiche `Index` (le site complet, accessible uniquement via ce chemin pour toi)

Comme ca, quand tu publies, les visiteurs tombent sur la page Coming Soon. Et toi, tu peux toujours accéder au site complet via `/home`.

### Détails techniques

**index.html** : Supprimer la ligne 4 (`<link rel="icon" href="/favicon.png" type="image/png" />`), garder la ligne 5.

**src/App.tsx** (ligne 85-86) :
```text
Avant :
  <Route path="/" element={<Index />} />
  <Route path="/launch" element={<LaunchIndex />} />
  <Route path="/coming-soon" element={<ComingSoon />} />

Apres :
  <Route path="/" element={<ComingSoon />} />
  <Route path="/home" element={<Index />} />
  <Route path="/launch" element={<LaunchIndex />} />
```

Aucun autre fichier ne sera modifie.
