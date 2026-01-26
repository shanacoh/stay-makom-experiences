

## Plan: Titres contextuels pour Login, Signup et Favoris

Afficher un titre et sous-titre différents dans le popup d'authentification selon 3 contextes :
- **Favoris** → Icône cœur + "Save to your wishlist"
- **Sign In** → Icône utilisateur + "Welcome back"  
- **Sign Up** → Icône étoile/utilisateur + "Join Staymakom"

---

### Aperçu visuel

| Contexte | Icône | Titre (EN) | Sous-titre (EN) |
|----------|-------|------------|-----------------|
| ❤️ Favoris | Heart | Save to your wishlist | Sign in to save experiences you love. |
| 👤 Sign In | User | Welcome back | Sign in to access your account. |
| ✨ Sign Up | UserPlus | Join Staymakom | Create an account to unlock exclusive experiences. |

---

### Modifications

**Fichier:** `src/components/auth/AuthPromptDialog.tsx`

#### 1. Ajouter une prop `context`

```typescript
type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lang: Lang;
  defaultTab?: "login" | "signup";
  onSignupSuccess?: (userId: string) => void;
  context?: "favorites" | "account" | "signup";  // NOUVEAU
};
```

#### 2. Ajouter les traductions contextuelles

```typescript
// Dans copyFor()
headers: {
  favorites: {
    title: "Save to your wishlist",
    subtitle: "Sign in to save experiences you love.",
  },
  account: {
    title: "Welcome back",
    subtitle: "Sign in to access your account.",
  },
  signup: {
    title: "Join Staymakom",
    subtitle: "Create an account to unlock exclusive experiences.",
  },
}
```

**Versions FR :**
- Favorites: "Sauvegarder dans vos favoris" / "Connectez-vous pour sauvegarder vos expériences préférées."
- Account: "Bon retour" / "Connectez-vous pour accéder à votre compte."
- Signup: "Rejoignez Staymakom" / "Créez un compte pour accéder à des expériences exclusives."

**Versions HE :**
- Favorites: "שמרו לרשימת המועדפים" / "התחברו לשמור חוויות שאהבתם."
- Account: "ברוכים השבים" / "התחברו לגשת לחשבון שלכם."
- Signup: "הצטרפו ל-Staymakom" / "צרו חשבון לגישה לחוויות בלעדיות."

#### 3. Afficher le titre et icône selon le contexte

```tsx
import { Heart, User, UserPlus } from "lucide-react";

// Déterminer le header basé sur le contexte
const headerKey = context || (tab === "signup" ? "signup" : "account");
const header = c.headers[headerKey];

// Icône dynamique
const HeaderIcon = context === "favorites" 
  ? Heart 
  : tab === "signup" 
    ? UserPlus 
    : User;

// Dans le JSX
<div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-2">
  <HeaderIcon className="h-5 w-5 text-primary" />
</div>
<h2 className="font-serif text-xl text-foreground">{header.title}</h2>
<p className="text-xs text-muted-foreground mt-1">{header.subtitle}</p>
```

---

**Fichier:** `src/components/Header.tsx`

#### 4. Étendre le state pour inclure le contexte

```typescript
const [authDialog, setAuthDialog] = useState<{ 
  open: boolean; 
  tab: "login" | "signup";
  context: "favorites" | "account" | "signup";
}>({ open: false, tab: "login", context: "account" });
```

#### 5. Passer le bon contexte selon l'action

```tsx
// Clic sur Favoris (heart)
const handleFavoritesClick = () => {
  if (user) {
    navigate("/account?tab=wishlist");
  } else {
    setAuthDialog({ open: true, tab: "login", context: "favorites" });
  }
};

// AccountBubble
onSignIn={() => setAuthDialog({ open: true, tab: "login", context: "account" })}
onSignUp={() => setAuthDialog({ open: true, tab: "signup", context: "signup" })}
```

#### 6. Passer la prop au composant

```tsx
<AuthPromptDialog
  open={authDialog.open}
  onOpenChange={(open) => setAuthDialog((prev) => ({ ...prev, open }))}
  lang={lang as "en" | "fr" | "he"}
  defaultTab={authDialog.tab}
  context={authDialog.context}
  onSignupSuccess={...}
/>
```

---

### Résultat

Le popup affichera maintenant :
- **Clic ❤️ Favoris** → Icône cœur + titre wishlist
- **Clic Sign In** → Icône utilisateur + titre "Welcome back"
- **Clic Sign Up** → Icône UserPlus + titre "Join Staymakom"

Le titre s'adapte aussi quand l'utilisateur bascule entre les onglets Login/Signup dans le popup.

