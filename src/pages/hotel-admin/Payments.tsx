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
          Connect your Stripe account to automatically receive your payments after each booking.
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
                <p className="font-medium">Account not connected</p>
                <p className="text-sm text-muted-foreground">Connect Stripe to receive your payments</p>
              </div>
            </div>
            <Button>Connect Stripe</Button>
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
