
## Plan : Icône Favoris dans le Header + Dropdown Premium pour Utilisateur Connecté

### Vue d'ensemble
1. Ajouter un bouton coeur (favoris) entre l'icône compte et le hamburger menu
2. Créer un nouveau composant `UserDropdown` premium avec design amélioré
3. Afficher le nom de l'utilisateur, son avatar et des catégories claires

---

### Partie 1 : Ajouter l'icône Favoris dans le Header

**Fichier : `src/components/Header.tsx`**

Ajouter un bouton coeur juste avant le HamburgerMenu :

```tsx
// Si connecté : navigation vers /account avec tab wishlist
// Si non connecté : ouvre AuthPromptDialog

<Button
  variant="ghost"
  size="icon"
  onClick={() => {
    if (user) {
      navigate("/account?tab=wishlist");
    } else {
      setAuthDialog({ open: true, tab: "login" });
    }
  }}
  className={/* styling adapté au scroll */}
>
  <Heart className="h-5 w-5" />
</Button>
```

---

### Partie 2 : Nouveau Composant UserDropdown Premium

**Nouveau fichier : `src/components/auth/UserDropdown.tsx`**

Design premium avec :

**Header du dropdown :**
- Avatar de l'utilisateur (initiales si pas d'image)
- Prénom + Nom complet
- Badge du tier de fidélité (Explorer, Traveler, etc.)
- Points actuels

**Catégories avec icônes :**
| Icône | Label | Action |
|-------|-------|--------|
| Heart | Mes Favoris | `/account?tab=wishlist` |
| Calendar | Mes Réservations | `/account?tab=bookings` |
| Gift | Mes Gift Cards | `/account?tab=giftcards` |
| User | Mon Compte | `/account?tab=profile` |
| --- | Séparateur | --- |
| LogOut | Déconnexion | `signOut()` |

**Styling premium :**
- Coins arrondis `rounded-2xl`
- Ombre douce `shadow-xl`
- Gradient subtil dans le header
- Transitions fluides sur hover
- Largeur généreuse `w-72`

**Code structure :**
```tsx
<Popover>
  <PopoverTrigger>
    <Avatar className="h-8 w-8 border-2 border-primary/20">
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  </PopoverTrigger>
  <PopoverContent className="w-72 p-0 rounded-2xl shadow-xl">
    {/* Header avec avatar, nom, tier */}
    <div className="p-4 bg-gradient-to-br from-muted/50 to-transparent">
      ...
    </div>
    
    {/* Menu items */}
    <div className="p-2">
      <MenuItem icon={Heart} label="Mes Favoris" />
      <MenuItem icon={Calendar} label="Mes Réservations" />
      <MenuItem icon={Gift} label="Mes Gift Cards" />
      <MenuItem icon={User} label="Mon Compte" />
      <Separator />
      <MenuItem icon={LogOut} label="Déconnexion" variant="destructive" />
    </div>
  </PopoverContent>
</Popover>
```

---

### Partie 3 : Mise à jour du Header

**Fichier : `src/components/Header.tsx`**

Remplacer le DropdownMenu actuel par le nouveau `UserDropdown` :

```tsx
{user ? (
  <>
    <UserDropdown 
      user={user}
      isTransparent={isTransparentPage && !isScrolled}
      onSignOut={handleSignOut}
      onNavigate={(path) => navigate(path)}
    />
    {/* Bouton favoris */}
    <FavoritesButton />
  </>
) : (
  <>
    <AccountBubble ... />
    {/* Bouton favoris qui ouvre login */}
    <FavoritesButton requiresAuth />
  </>
)}
```

---

### Partie 4 : Gestion du tab Gift Cards

**Fichier : `src/pages/Account.tsx`**

Ajouter un 4ème tab pour les Gift Cards :

```tsx
<TabsTrigger value="giftcards">
  <Gift className="h-4 w-4" />
  <span>My Gift Cards</span>
</TabsTrigger>

<TabsContent value="giftcards">
  <GiftCardsSection userId={user.id} />
</TabsContent>
```

**Nouveau fichier : `src/components/account/GiftCardsSection.tsx`**

Affiche les gift cards achetées ou reçues par l'utilisateur.

---

### Traductions

Ajouter dans `src/lib/translations.ts` :

| Clé | EN | FR | HE |
|-----|----|----|-----|
| myFavorites | My Favorites | Mes Favoris | המועדפים שלי |
| myBookings | My Bookings | Mes Réservations | ההזמנות שלי |
| myGiftCards | My Gift Cards | Mes Cartes Cadeaux | כרטיסי המתנה שלי |
| myAccount | My Account | Mon Compte | החשבון שלי |
| signOut | Sign Out | Déconnexion | התנתקות |

---

### Résultat attendu

**Avant (utilisateur connecté) :**
```
[Logo] ... [EN|עב] [HOTEL+EXP] [User icon dropdown basique] [☰]
```

**Après (utilisateur connecté) :**
```
[Logo] ... [EN|עב] [HOTEL+EXP] [Avatar premium dropdown] [♡] [☰]
```

**Dropdown premium :**
```
┌────────────────────────────────┐
│  ○ John Doe                    │
│  ⭐ Traveler • 850 pts         │
├────────────────────────────────┤
│  ♡  Mes Favoris               │
│  📅 Mes Réservations          │
│  🎁 Mes Gift Cards            │
│  👤 Mon Compte                │
│  ─────────────────────────    │
│  🚪 Déconnexion               │
└────────────────────────────────┘
```

---

### Section Technique

**Fichiers à créer :**
- `src/components/auth/UserDropdown.tsx`
- `src/components/account/GiftCardsSection.tsx`

**Fichiers à modifier :**
- `src/components/Header.tsx` (ajouter Heart button + UserDropdown)
- `src/pages/Account.tsx` (ajouter tab giftcards, lire query param)
- `src/lib/translations.ts` (nouvelles clés)

**Query param handling :**
Dans `Account.tsx`, lire `?tab=wishlist` pour activer le bon onglet :
```tsx
const [searchParams] = useSearchParams();
const tabFromUrl = searchParams.get("tab");

useEffect(() => {
  if (tabFromUrl && ["wishlist", "bookings", "giftcards", "profile"].includes(tabFromUrl)) {
    setActiveTab(tabFromUrl);
  }
}, [tabFromUrl]);
```

