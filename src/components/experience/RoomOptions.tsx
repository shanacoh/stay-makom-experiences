/**
 * RoomOptions V1 — used by BookingPanel V1 (Experience old route)
 * Minimal stub preserved to maintain backward compatibility
 */
interface RoomOptionsProps {
  hotelId: string;
  checkin: string;
  checkout: string;
  guests: number;
  selectedRoom: any;
  onSelectRoom: (room: any) => void;
}

const RoomOptions = ({ selectedRoom, onSelectRoom }: RoomOptionsProps) => {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Room selection (V1)</p>
    </div>
  );
};

export default RoomOptions;
