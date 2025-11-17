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
        <label className="text-sm font-medium">Upgrade de chambre</label>
        <div className="p-6 flex items-center justify-center border-2 border-border rounded-lg">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Upgrade de chambre</label>
        <div className="p-6 border-2 border-border rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Upgrade de chambre</label>
      <RadioGroup
        value={selectedRoom?.code || ""}
        onValueChange={(code) => {
          const room = rooms.find((r) => r.code === code);
          if (room) onSelectRoom(room);
        }}
      >
        <div className="space-y-2">
          {rooms.map((room) => (
            <label
              key={room.code}
              htmlFor={room.code}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50 ${
                selectedRoom?.code === room.code
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
            >
              <RadioGroupItem 
                value={room.code} 
                id={room.code}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-medium text-sm">{room.name}</div>
                    <div className="text-xs text-muted-foreground">{room.board}</div>
                    {room.cancellable && (
                      <div className="text-xs text-green-600 mt-0.5">Annulation gratuite</div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold">{room.price_total} {room.currency}</div>
                    <div className="text-xs text-muted-foreground">total</div>
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
};

export default RoomOptions;
