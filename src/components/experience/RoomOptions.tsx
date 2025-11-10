import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface Room {
  code: string;
  name: string;
  board: string;
  cancellable: boolean;
  price_total: number;
  currency: string;
}

interface RoomOptionsProps {
  hotelId: string;
  checkin: Date;
  checkout: Date;
  guests: number;
  selectedRoom: Room | null;
  onSelectRoom: (room: Room) => void;
}

// Mock API provider
const mockRoomProvider = {
  searchRooms: async (params: {
    hotel_id: string;
    checkin: Date;
    checkout: Date;
    guests: number;
  }): Promise<Room[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return [
      {
        code: "DELUXE",
        name: "Deluxe Room",
        board: "Breakfast included",
        cancellable: true,
        price_total: 320,
        currency: "USD",
      },
      {
        code: "SUITE",
        name: "Suite with Balcony",
        board: "Half Board",
        cancellable: true,
        price_total: 480,
        currency: "USD",
      },
      {
        code: "PREMIUM",
        name: "Premium Ocean View",
        board: "Full Board",
        cancellable: false,
        price_total: 650,
        currency: "USD",
      },
    ];
  },
};

const RoomOptions = ({
  hotelId,
  checkin,
  checkout,
  guests,
  selectedRoom,
  onSelectRoom,
}: RoomOptionsProps) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      setError(null);

      try {
        const roomData = await mockRoomProvider.searchRooms({
          hotel_id: hotelId,
          checkin,
          checkout,
          guests,
        });
        setRooms(roomData);
      } catch (err) {
        setError("Unable to load room options. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [hotelId, checkin, checkout, guests]);

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Room Options</label>
        <Card className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Room Options</label>
        <Card className="p-6">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Room Options</label>
      <RadioGroup
        value={selectedRoom?.code}
        onValueChange={(code) => {
          const room = rooms.find((r) => r.code === code);
          if (room) onSelectRoom(room);
        }}
      >
        <div className="space-y-3">
          {rooms.map((room) => (
            <Card key={room.code} className="p-4 hover:border-primary transition-colors">
              <div className="flex items-start gap-4">
                <RadioGroupItem value={room.code} id={room.code} className="mt-1" />
                <Label htmlFor={room.code} className="flex-1 cursor-pointer">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <p className="font-medium">{room.name}</p>
                      <p className="text-sm text-muted-foreground">{room.board}</p>
                      <p className="text-xs text-muted-foreground">
                        {room.cancellable ? "Free cancellation" : "Non-refundable"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        ${room.price_total}
                      </p>
                      <p className="text-xs text-muted-foreground">total</p>
                    </div>
                  </div>
                </Label>
              </div>
            </Card>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
};

export default RoomOptions;
