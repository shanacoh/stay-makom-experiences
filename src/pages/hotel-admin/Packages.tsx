import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function HotelPackages() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-4xl font-bold">Packages</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Package
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Special Offers & Bundles</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No packages created yet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
