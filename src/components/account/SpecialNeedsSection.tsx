import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Mail, Accessibility, UtensilsCrossed, Heart, Sparkles } from "lucide-react";

interface SpecialNeedsSectionProps {
  contactEmail?: string;
}

export default function SpecialNeedsSection({ contactEmail = "hello@staymakom.com" }: SpecialNeedsSectionProps) {
  const handleContact = () => {
    window.location.href = `mailto:${contactEmail}?subject=Special Request for My Stay`;
  };

  const examples = [
    { icon: UtensilsCrossed, label: "Dietary requirements" },
    { icon: Accessibility, label: "Accessibility needs" },
    { icon: Heart, label: "Special celebrations" },
    { icon: Sparkles, label: "Custom experiences" },
  ];

  return (
    <Card className="mt-8 border-dashed border-2 border-accent/30 bg-accent/5">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="flex-shrink-0">
            <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
              <MessageSquare className="h-7 w-7 text-accent" />
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <h3 className="font-serif text-xl text-foreground">Have specific needs?</h3>
            <p className="text-muted-foreground">
              We're here to make your experience perfect. Whether it's dietary restrictions, accessibility
              requirements, or a special celebration, our team will personally arrange everything.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {examples.map((example) => (
                <span
                  key={example.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background text-sm text-muted-foreground border border-border/50"
                >
                  <example.icon className="h-3.5 w-3.5" />
                  {example.label}
                </span>
              ))}
            </div>
          </div>

          <Button variant="cta" onClick={handleContact} className="gap-2 w-full md:w-auto">
            <Mail className="h-4 w-4" />
            Contact Us
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
