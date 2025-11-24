import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Mail } from "lucide-react";

interface MarketingOptInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (confirmed: boolean) => void;
}

export default function MarketingOptInDialog({
  open,
  onOpenChange,
  onConfirm,
}: MarketingOptInDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary" />
            </div>
          </div>
          <AlertDialogTitle className="text-center text-xl">
            Unsubscribe from StayMakom News?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Are you sure you want to unsubscribe? You may miss:
            <ul className="mt-4 space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Exclusive experiences and hidden gems</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Early access to new releases</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Special deals and promotions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Curated travel inspiration</span>
              </li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={() => onConfirm(false)}>
            Keep Me Subscribed
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(true)}
            className="bg-destructive hover:bg-destructive/90"
          >
            Unsubscribe Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
