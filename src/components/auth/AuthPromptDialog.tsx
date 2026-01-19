import { useMemo, useState } from "react";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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

const signupSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    displayName: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

function copyFor(lang: Lang) {
  switch (lang) {
    case "fr":
      return {
        title: "Connectez-vous pour ajouter aux favoris",
        tabs: { login: "Connexion", signup: "Inscription" },
        fields: {
          email: "Email",
          password: "Mot de passe",
          confirm: "Confirmer le mot de passe",
          name: "Nom (optionnel)",
        },
        actions: { login: "Se connecter", signup: "Créer un compte" },
        toasts: {
          okLogin: "Connecté !",
          okSignup: "Compte créé ! Vous pouvez vous connecter.",
          invalid: "Vérifiez vos informations.",
        },
      };
    case "he":
      return {
        title: "התחברו כדי להוסיף למועדפים",
        tabs: { login: "התחברות", signup: "הרשמה" },
        fields: {
          email: "אימייל",
          password: "סיסמה",
          confirm: "אימות סיסמה",
          name: "שם (אופציונלי)",
        },
        actions: { login: "התחבר", signup: "צור חשבון" },
        toasts: {
          okLogin: "התחברת!",
          okSignup: "החשבון נוצר! אפשר להתחבר עכשיו.",
          invalid: "בדקו את הפרטים.",
        },
      };
    default:
      return {
        title: "Sign in to save to wishlist",
        tabs: { login: "Sign In", signup: "Sign Up" },
        fields: {
          email: "Email",
          password: "Password",
          confirm: "Confirm password",
          name: "Name (optional)",
        },
        actions: { login: "Sign In", signup: "Create account" },
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

  const [tab, setTab] = useState<"login" | "signup">(defaultTab);
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{c.title}</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{c.tabs.login}</TabsTrigger>
            <TabsTrigger value="signup">{c.tabs.signup}</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="auth-dialog-login-email">{c.fields.email}</Label>
                <Input
                  id="auth-dialog-login-email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData((p) => ({ ...p, email: e.target.value }))
                  }
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth-dialog-login-password">{c.fields.password}</Label>
                <Input
                  id="auth-dialog-login-password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData((p) => ({ ...p, password: e.target.value }))
                  }
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {c.actions.login}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="auth-dialog-signup-name">{c.fields.name}</Label>
                <Input
                  id="auth-dialog-signup-name"
                  type="text"
                  value={signupData.displayName}
                  onChange={(e) =>
                    setSignupData((p) => ({ ...p, displayName: e.target.value }))
                  }
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth-dialog-signup-email">{c.fields.email}</Label>
                <Input
                  id="auth-dialog-signup-email"
                  type="email"
                  value={signupData.email}
                  onChange={(e) =>
                    setSignupData((p) => ({ ...p, email: e.target.value }))
                  }
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth-dialog-signup-password">{c.fields.password}</Label>
                <Input
                  id="auth-dialog-signup-password"
                  type="password"
                  value={signupData.password}
                  onChange={(e) =>
                    setSignupData((p) => ({ ...p, password: e.target.value }))
                  }
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth-dialog-signup-confirm">{c.fields.confirm}</Label>
                <Input
                  id="auth-dialog-signup-confirm"
                  type="password"
                  value={signupData.confirmPassword}
                  onChange={(e) =>
                    setSignupData((p) => ({ ...p, confirmPassword: e.target.value }))
                  }
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {c.actions.signup}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
