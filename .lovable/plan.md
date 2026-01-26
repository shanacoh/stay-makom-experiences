

## Plan: Privacy Policy Acceptance + Login/Signup Toggle Links

Add legal acceptance text for signup and a toggle link below the buttons for both login and signup forms, inspired by the example screenshot.

---

### Design Preview

**Signup Form (after fields, before button):**
```text
By continuing, I accept the Terms of Use of Staymakom 
and acknowledge the Privacy Policy.

      [ Create my account ]

Don't have an account? Sign up
```

**Login Form (after button):**
```text
      [ Continue ]

No account yet? Sign up
```

---

### Changes

**File:** `src/components/auth/AuthPromptDialog.tsx`

#### 1. Add translations to the `copyFor` function

Add new translation keys:
```typescript
legal: {
  prefix: "By continuing, I accept the",
  terms: "Terms of Use",
  and: "and acknowledge the",
  privacy: "Privacy Policy",
},
toggle: {
  noAccount: "No account yet?",
  hasAccount: "Already have an account?",
  signUp: "Sign up",
  signIn: "Sign in",
}
```

With French and Hebrew versions:
- **FR**: "En continuant, j'accepte les Conditions d'utilisation de Staymakom et reconnais la Politique de confidentialité."
- **HE**: "בהמשך, אני מקבל/ת את תנאי השימוש ומאשר/ת את מדיניות הפרטיות."

#### 2. Add legal acceptance text above the signup button

Insert before the submit button in the signup form (around line 494):
```tsx
{/* Legal acceptance text */}
<p className="text-xs text-muted-foreground text-center leading-relaxed pt-2">
  {c.legal.prefix}{" "}
  <Link to="/terms" className="text-primary hover:underline">{c.legal.terms}</Link>
  {" "}{c.legal.and}{" "}
  <Link to="/privacy" className="text-primary hover:underline">{c.legal.privacy}</Link>.
</p>
```

#### 3. Add toggle links below the buttons

**After the login button (line 337):**
```tsx
<p className="text-xs text-muted-foreground text-center pt-3">
  {c.toggle.noAccount}{" "}
  <button 
    type="button" 
    onClick={() => setTab("signup")} 
    className="text-foreground font-medium underline hover:no-underline"
  >
    {c.toggle.signUp}
  </button>
</p>
```

**After the signup button (line 498):**
```tsx
<p className="text-xs text-muted-foreground text-center pt-3">
  {c.toggle.hasAccount}{" "}
  <button 
    type="button" 
    onClick={() => setTab("login")} 
    className="text-foreground font-medium underline hover:no-underline"
  >
    {c.toggle.signIn}
  </button>
</p>
```

#### 4. Import Link from react-router-dom

Add to imports:
```tsx
import { Link } from "react-router-dom";
```

---

### Result

- **Signup form**: Displays legal text with clickable Terms and Privacy links above the submit button, plus a "Already have an account? Sign in" link below
- **Login form**: Displays "No account yet? Sign up" link below the button
- Clean, elegant styling matching the premium design language
- Fully translated in English, French, and Hebrew

