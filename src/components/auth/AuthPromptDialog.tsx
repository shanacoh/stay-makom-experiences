import { useMemo, useState } from "react";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Heart, Loader2 } from "lucide-react";

type Lang = "en" | "fr" | "he";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lang: Lang;
  defaultTab?: "login" | "signup";
};

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().optional(),
});

function copyFor(lang: Lang) {
  switch (lang) {
    case "fr":
      return {
        title: "Sauvegarder dans vos favoris",
        subtitle: "Connectez-vous pour sauvegarder vos expériences préférées et y accéder depuis n'importe quel appareil.",
        tabs: { login: "Connexion", signup: "Inscription" },
        fields: {
          email: "Email",
          password: "Mot de passe",
          confirm: "Confirmer le mot de passe",
          name: "Nom (optionnel)",
        },
        actions: { login: "Continuer", signup: "Créer un compte" },
        toasts: {
          okLogin: "Connecté !",
          okSignup: "Compte créé ! Vous pouvez vous connecter.",
          invalid: "Vérifiez vos informations.",
        },
      };
    case "he":
      return {
        title: "שמרו לרשימת המועדפים",
        subtitle: "התחברו כדי לשמור חוויות שאהבתם ולגשת אליהן מכל מכשיר.",
        tabs: { login: "התחברות", signup: "הרשמה" },
        fields: {
          email: "אימייל",
          password: "סיסמה",
          confirm: "אימות סיסמה",
          name: "שם (אופציונלי)",
        },
        actions: { login: "המשך", signup: "צור חשבון" },
        toasts: {
          okLogin: "התחברת!",
          okSignup: "החשבון נוצר! אפשר להתחבר עכשיו.",
          invalid: "בדקו את הפרטים.",
        },
      };
    default:
      return {
        title: "Save to your wishlist",
        subtitle: "Sign in to save experiences you love and access them from any device.",
        tabs: { login: "Sign In", signup: "Sign Up" },
        fields: {
          email: "Email",
          password: "Password",
          confirm: "Confirm password",
          name: "Name (optional)",
        },
        actions: { login: "Continue", signup: "Create account" },
        toasts: {
          okLogin: "Signed in!",
          okSignup: "Account created! You can sign in now.",
          invalid: "Please check your details.",
        },
      };
  }
}

export default function AuthPromptDialog({
  open,
  onOpenChange,
  lang,
  defaultTab = "login",
}: Props) {
  const c = useMemo(() => copyFor(lang), [lang]);
  const { signIn, signUp } = useAuth();
  const isRTL = lang === "he";

  const [tab, setTab] = useState<"login" | "signup">(defaultTab);
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    displayName: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse(loginData);
    if (!parsed.success) {
      toast.error(c.toasts.invalid);
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(parsed.data.email, parsed.data.password);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(c.toasts.okLogin);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse(signupData);
    if (!parsed.success) {
      toast.error(c.toasts.invalid);
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(
        parsed.data.email,
        parsed.data.password,
        parsed.data.displayName || undefined
      );
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(c.toasts.okSignup);
      setTab("login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl p-0 overflow-hidden border-0 shadow-2xl"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header with decorative icon */}
        <div className="pt-8 pb-4 px-6 text-center bg-gradient-to-b from-muted/50 to-transparent">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
            <Heart className="h-6 w-6 text-primary" />
          </div>
          <h2 className="font-serif text-2xl text-foreground mb-2">
            {c.title}
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            {c.subtitle}
          </p>
        </div>

        <div className="px-6 pb-6">
          {/* Tabs - Pill style */}
          <div className="flex p-1 bg-muted/60 rounded-full mb-6">
            <button
              type="button"
              onClick={() => setTab("login")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-all duration-200 ${
                tab === "login"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.tabs.login}
            </button>
            <button
              type="button"
              onClick={() => setTab("signup")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-all duration-200 ${
                tab === "signup"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.tabs.signup}
            </button>
          </div>

          {/* Login Form */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="auth-dialog-login-email" className="text-sm font-medium">
                  {c.fields.email}
                </Label>
                <Input
                  id="auth-dialog-login-email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData((p) => ({ ...p, email: e.target.value }))
                  }
                  disabled={loading}
                  className="h-12 rounded-xl bg-muted/50 border-border/50 focus:bg-background transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth-dialog-login-password" className="text-sm font-medium">
                  {c.fields.password}
                </Label>
                <Input
                  id="auth-dialog-login-password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData((p) => ({ ...p, password: e.target.value }))
                  }
                  disabled={loading}
                  className="h-12 rounded-xl bg-muted/50 border-border/50 focus:bg-background transition-colors"
                />
              </div>

              <Button 
                type="submit" 
                variant="cta"
                className="w-full h-12 text-base mt-2" 
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {c.actions.login}
              </Button>
            </form>
          )}

          {/* Signup Form */}
          {tab === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="auth-dialog-signup-name" className="text-sm font-medium">
                  {c.fields.name}
                </Label>
                <Input
                  id="auth-dialog-signup-name"
                  type="text"
                  value={signupData.displayName}
                  onChange={(e) =>
                    setSignupData((p) => ({ ...p, displayName: e.target.value }))
                  }
                  disabled={loading}
                  className="h-12 rounded-xl bg-muted/50 border-border/50 focus:bg-background transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth-dialog-signup-email" className="text-sm font-medium">
                  {c.fields.email}
                </Label>
                <Input
                  id="auth-dialog-signup-email"
                  type="email"
                  value={signupData.email}
                  onChange={(e) =>
                    setSignupData((p) => ({ ...p, email: e.target.value }))
                  }
                  disabled={loading}
                  className="h-12 rounded-xl bg-muted/50 border-border/50 focus:bg-background transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth-dialog-signup-password" className="text-sm font-medium">
                  {c.fields.password}
                </Label>
                <Input
                  id="auth-dialog-signup-password"
                  type="password"
                  value={signupData.password}
                  onChange={(e) =>
                    setSignupData((p) => ({ ...p, password: e.target.value }))
                  }
                  disabled={loading}
                  className="h-12 rounded-xl bg-muted/50 border-border/50 focus:bg-background transition-colors"
                />
              </div>


              <Button 
                type="submit" 
                variant="cta"
                className="w-full h-12 text-base mt-2" 
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {c.actions.signup}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
