/**
 * ExtrasSelector V1 — used by BookingPanel V1 (Experience old route)
 * Minimal stub preserved to maintain backward compatibility
 */
interface ExtrasSelectorProps {
  experienceId: string;
  partySize: number;
  selectedExtras: any[];
  onExtrasChange: (extras: any[], total: number) => void;
}

const ExtrasSelector = (_props: ExtrasSelectorProps) => {
  return null;
};

export default ExtrasSelector;
