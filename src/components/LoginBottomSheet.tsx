import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { X } from "lucide-react";

interface LoginBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LoginBottomSheet = ({ open, onOpenChange }: LoginBottomSheetProps) => {
  const navigate = useNavigate();

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="px-6 pb-8 pt-2">
        <div className="flex justify-end -mb-2">
          <DrawerClose asChild>
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full">
              <X size={20} />
            </button>
          </DrawerClose>
        </div>

        <div className="flex flex-col items-center text-center pt-2 pb-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Heart size={22} className="text-primary" strokeWidth={1.5} />
          </div>

          <DrawerTitle className="text-lg font-serif font-semibold text-foreground mb-2">
            Save this escape
          </DrawerTitle>

          <DrawerDescription className="text-sm text-muted-foreground leading-relaxed max-w-[260px]">
            Create a free account to save your favourite stays & experiences
          </DrawerDescription>
        </div>

        <div className="flex flex-col gap-3 mt-4">
          <Button
            className="w-full rounded-full"
            onClick={() => {
              onOpenChange(false);
              navigate("/auth?tab=login");
            }}
          >
            Log in
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-full border-primary text-primary hover:bg-primary/5"
            onClick={() => {
              onOpenChange(false);
              navigate("/auth?tab=signup");
            }}
          >
            Join the list
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default LoginBottomSheet;
