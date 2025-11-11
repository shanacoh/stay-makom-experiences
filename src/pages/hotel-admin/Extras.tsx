import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function HotelExtras() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-4xl font-bold">Extras & Add-ons</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Extra
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Extras</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No extras configured yet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
