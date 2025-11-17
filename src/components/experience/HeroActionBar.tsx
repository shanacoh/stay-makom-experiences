import { Heart, Share2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";

interface HeroActionBarProps {
  onOpenGallery: () => void;
  experienceTitle: string;
}

const HeroActionBar = ({ onOpenGallery, experienceTitle }: HeroActionBarProps) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: experienceTitle,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Share this experience with your friends",
      });
    }
  };

  const handleFavorite = () => {
    toast({
      title: "Saved to favorites",
      description: "You can find this experience in your saved items",
    });
  };

  return (
    <div className="absolute bottom-8 right-8 z-20 flex items-center gap-2">
      <TooltipProvider>
        {/* Share */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full h-11 w-11 bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5 text-primary" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share</p>
          </TooltipContent>
        </Tooltip>

        {/* Favorite */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full h-11 w-11 bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
              onClick={handleFavorite}
            >
              <Heart className="h-5 w-5 text-primary" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Save</p>
          </TooltipContent>
        </Tooltip>

        {/* See Pictures */}
        <Button
          variant="secondary"
          className="rounded-full h-11 px-4 bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm gap-2"
          onClick={onOpenGallery}
        >
          <Camera className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline text-sm font-medium text-primary">See pictures</span>
          <span className="sm:hidden text-sm font-medium text-primary">Photos</span>
        </Button>
      </TooltipProvider>
    </div>
  );
};

export default HeroActionBar;
