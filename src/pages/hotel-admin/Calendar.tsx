import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HotelCalendar() {
  return (
    <div className="p-8">
      <h1 className="font-serif text-4xl font-bold mb-8">Calendar & Availability</h1>

      <Card>
        <CardHeader>
          <CardTitle>Manage Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Calendar view coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
