
## Plan : Refonte Premium de l'Espace Client

### Vue d'ensemble

Transformer l'espace client en une interface moderne avec navigation latérale, cartes compactes pour les recommandations, et une section de demande personnalisée avec formulaire de contact intégré.

---

### Partie 1 : Navigation Latérale (Sidebar)

**Structure de la page :**

```text
┌─────────────────────────────────────────────────────────┐
│                    Account Header                       │
│  (Avatar, nom, tier fidélité, points)                   │
├──────────────┬──────────────────────────────────────────┤
│   SIDEBAR    │           CONTENU PRINCIPAL              │
│              │                                          │
│ ♡ Wishlist   │  [Section active selon l'onglet]         │
│ 📅 Bookings  │                                          │
│ 🎁 Gift Cards│  ────────────────────────────────        │
│ 👤 My Account│                                          │
│              │  You might also like (cartes compactes)  │
│              │                                          │
│              │  ────────────────────────────────        │
│              │                                          │
│              │  Section demande personnalisée           │
│              │  [Formulaire de contact]                 │
└──────────────┴──────────────────────────────────────────┘
```

**Comportement responsive :**
- Desktop : Sidebar fixe de 250px sur la gauche
- Mobile : Bottom navigation ou tabs horizontaux (comme actuellement)

**Styling de la sidebar :**
- Fond légèrement coloré (`bg-muted/30`)
- Items avec icônes et labels
- Item actif avec accent (`bg-accent/10`, bordure gauche colorée)
- Espacement généreux pour un look premium

---

### Partie 2 : Cartes Recommandations Compactes

**Nouveau composant : `CompactExperienceCard`**

Design ultra-compact pour "You might also like" :

```text
┌─────────────────────────────────────┐
│  [Image 80x80]  Hotel Name          │
│                 Experience Title    │
│                 ★ 9.1 • $299/night  │
└─────────────────────────────────────┘
```

**Caractéristiques :**
- Image carrée 80x80px avec coins arrondis
- Layout horizontal (image + texte)
- Hauteur fixe ~100px
- Grille 2 colonnes sur desktop, 1 colonne sur mobile
- Bouton coeur au hover

**Modifier `RecommendedExperiences.tsx` :**
- Prop `compact={true}` pour utiliser le nouveau design
- Afficher 4 expériences au lieu de 3
- Réduire l'espacement vertical

---

### Partie 3 : Section Demande Personnalisée

**Nouveau composant : `PersonalizedRequestSection`**

Remplace `SpecialNeedsSection` avec un formulaire complet :

**Design :**
```text
┌─────────────────────────────────────────────────────────┐
│  ✨ Une demande particulière ?                          │
│                                                         │
│  Notre équipe est à votre disposition pour organiser    │
│  votre séjour sur-mesure.                               │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Type de demande        [▼ Dropdown]                ││
│  ├─────────────────────────────────────────────────────┤│
│  │ Votre message                                      ││
│  │ [                                                 ]││
│  │ [                                                 ]││
│  │ [                                                 ]││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  [        Envoyer ma demande        ]                   │
│                                                         │
│  💬 Ou contactez-nous : hello@staymakom.com             │
└─────────────────────────────────────────────────────────┘
```

**Types de demandes (dropdown) :**
- Dietary requirements / Besoins alimentaires
- Accessibility needs / Besoins d'accessibilité  
- Special celebration / Célébration spéciale
- Custom experience / Expérience sur-mesure
- Group booking / Réservation de groupe
- Other / Autre

**Fonctionnalités :**
- Formulaire pré-rempli avec le nom et email de l'utilisateur
- Appel à l'Edge Function `send-contact-request` existante
- Toast de confirmation après envoi
- Design avec bordure accent et fond subtil

---

### Partie 4 : Améliorations UX Supplémentaires

**4.1 Empty States Améliorés**

Pour chaque section vide, design engageant :

```text
┌─────────────────────────────────────────────────────────┐
│              [Illustration ou icône grande]             │
│                                                         │
│           Votre liste de favoris est vide               │
│                                                         │
│   Explorez nos expériences et sauvegardez vos coups    │
│   de coeur pour plus tard.                             │
│                                                         │
│   [  Découvrir les expériences  ]                      │
└─────────────────────────────────────────────────────────┘
```

**4.2 Cartes Bookings Améliorées**

- Ajouter un countdown pour les réservations à venir ("Dans 12 jours")
- Badge "À venir" / "Passé" avec couleurs distinctes
- Quick actions : "Voir détails", "Contacter l'hôtel"

**4.3 Section Gift Cards Enrichie**

- Afficher aussi les gift cards reçues (pas seulement achetées)
- Badge d'expiration si proche ("Expire dans 30 jours")
- Bouton "Offrir une Gift Card" si la liste est vide

---

### Partie 5 : Structure des Fichiers

**Fichiers à créer :**
- `src/components/account/AccountSidebar.tsx` (navigation latérale)
- `src/components/account/CompactExperienceCard.tsx` (carte compacte)
- `src/components/account/PersonalizedRequestSection.tsx` (formulaire de demande)

**Fichiers à modifier :**
- `src/pages/Account.tsx` (layout avec sidebar)
- `src/components/account/RecommendedExperiences.tsx` (mode compact)
- `src/components/account/WishlistSection.tsx` (empty state amélioré)
- `src/components/account/MyStaymakomSection.tsx` (countdown + badges)
- `src/components/account/GiftCardsSection.tsx` (gift cards reçues)

---

### Section Technique

**Layout avec Sidebar (Account.tsx) :**
```tsx
<div className="flex flex-col lg:flex-row gap-8">
  {/* Sidebar - hidden on mobile */}
  <aside className="hidden lg:block w-64 flex-shrink-0">
    <AccountSidebar 
      activeTab={activeTab} 
      onTabChange={setActiveTab} 
    />
  </aside>
  
  {/* Mobile tabs - visible on mobile only */}
  <div className="lg:hidden">
    <TabsList className="...">...</TabsList>
  </div>
  
  {/* Main content */}
  <div className="flex-1 min-w-0">
    {/* Active section content */}
    {/* Recommendations (compact) */}
    {/* Personalized request form */}
  </div>
</div>
```

**Formulaire demande personnalisée :**
```tsx
const handleSubmit = async () => {
  await supabase.functions.invoke('send-contact-request', {
    body: {
      name: profile.display_name,
      email: user.email,
      subject: `[Account Request] ${requestType}`,
      message: message,
      language: lang
    }
  });
};
```

**Compact Card Layout :**
```tsx
<div className="flex gap-3 p-2 rounded-lg hover:bg-muted/50">
  <img className="w-20 h-20 rounded-lg object-cover" />
  <div className="flex-1 min-w-0">
    <p className="text-sm font-medium">{hotelName}</p>
    <p className="text-base font-semibold">{title}</p>
    <p className="text-sm text-muted-foreground">★ {rating} • {price}</p>
  </div>
</div>
```

---

### Résultat Attendu

**Avant :**
- Tabs horizontaux en haut
- Cartes expériences grandes
- Pas de formulaire de contact intégré

**Après :**
- Navigation latérale premium (desktop)
- Cartes compactes élégantes pour les recommandations
- Section demande personnalisée avec formulaire intégré
- Empty states engageants
- Countdown sur les réservations à venir
- UX fluide et premium
