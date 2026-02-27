
# Remettre la route principale

Inverser le changement fait precedemment :

**`src/App.tsx`** (lignes 85-86) :
- `/` → `Index` (page principale)
- `/coming-soon` → `ComingSoon`
- Supprimer la route `/home`

```text
Avant :
  <Route path="/" element={<ComingSoon />} />
  <Route path="/home" element={<Index />} />

Apres :
  <Route path="/" element={<Index />} />
  <Route path="/coming-soon" element={<ComingSoon />} />
```

Aucun autre fichier modifie.
