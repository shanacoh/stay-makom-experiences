import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function HotelPayments() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-sans text-4xl font-bold mb-2">Paiements</h1>
        <p className="text-muted-foreground">Gérez votre compte Stripe et suivez vos transferts</p>
      </div>

      <Alert className="mb-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Connectez votre compte Stripe pour recevoir automatiquement vos paiements après chaque réservation.
        </AlertDescription>
      </Alert>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Compte Stripe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-6 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-4">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">Compte non connecté</p>
                <p className="text-sm text-muted-foreground">Connectez Stripe pour recevoir vos paiements</p>
              </div>
            </div>
            <Button>Connecter Stripe</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historique des transferts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Aucun transfert pour le moment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
