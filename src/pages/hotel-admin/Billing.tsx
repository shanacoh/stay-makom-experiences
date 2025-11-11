import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HotelBilling() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-4xl font-bold">Billing & Commissions</h1>
        <Button variant="outline">Export CSV</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No billing data available yet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
