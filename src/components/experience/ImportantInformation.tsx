import { Clock, MapPin, Accessibility, Wifi } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ImportantInformationProps {
  checkinTime?: string;
  checkoutTime?: string;
  address?: string;
  googleMapsLink?: string;
  accessibilityInfo?: string;
  services?: string[];
}

const ImportantInformation = ({
  checkinTime,
  checkoutTime,
  address,
  googleMapsLink,
  accessibilityInfo,
  services,
}: ImportantInformationProps) => {
  const hasAnyInfo = checkinTime || checkoutTime || address || accessibilityInfo || (services && services.length > 0);

  if (!hasAnyInfo) return null;

  return (
    <div className="space-y-6">
      <h2 className="font-sans text-3xl font-bold">Important information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(checkinTime || checkoutTime) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-primary" />
                Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {checkinTime && (
                <div>
                  <span className="font-medium">Check-in:</span> {checkinTime}
                </div>
              )}
              {checkoutTime && (
                <div>
                  <span className="font-medium">Check-out:</span> {checkoutTime}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {address && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="w-5 h-5 text-primary" />
                Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>{address}</p>
              {googleMapsLink && (
                <a
                  href={googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  View on Google Maps →
                </a>
              )}
            </CardContent>
          </Card>
        )}

        {accessibilityInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Accessibility className="w-5 h-5 text-primary" />
                Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{accessibilityInfo}</p>
            </CardContent>
          </Card>
        )}

        {services && services.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wifi className="w-5 h-5 text-primary" />
                Services & amenities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {services.map((service, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ImportantInformation;
