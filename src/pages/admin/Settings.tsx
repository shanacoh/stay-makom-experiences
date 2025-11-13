import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AdminSettings = () => {
  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage site configuration</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Site Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">Site Name</Label>
              <Input id="site-name" defaultValue="STAYMAKOM" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-tagline">Tagline</Label>
              <Input id="site-tagline" defaultValue="Israel... differently." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact-email">General Email</Label>
              <Input id="contact-email" type="email" defaultValue="hello@staymakom.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partners-email">Partners Email</Label>
              <Input id="partners-email" type="email" defaultValue="partners@staymakom.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram Handle</Label>
              <Input id="instagram" defaultValue="@staymakom" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="commission">Default Commission Rate (%)</Label>
              <Input id="commission" type="number" defaultValue="18" step="0.1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Input id="currency" defaultValue="USD" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stripe-key">Stripe Publishable Key</Label>
              <Input id="stripe-key" type="password" placeholder="pk_..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stripe-secret">Stripe Secret Key</Label>
              <Input id="stripe-secret" type="password" placeholder="sk_..." />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
