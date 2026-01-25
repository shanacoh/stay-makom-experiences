import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShareDialog from "./ShareDialog";
import { toast } from "@/hooks/use-toast";

interface ShareWithFriendsSectionProps {
  title: string;
  lang: 'en' | 'he' | 'fr';
}

const ShareWithFriendsSection = ({ title, lang }: ShareWithFriendsSectionProps) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const getText = (key: string) => {
    const texts: { [key: string]: { en: string; fr: string; he: string } } = {
      sectionTitle: {
        en: "Share with friends",
        fr: "Partagez avec vos amis",
        he: "שתפו עם חברים"
      },
      sectionSubtitle: {
        en: "Know someone who would love this experience?",
        fr: "Vous connaissez quelqu'un qui aimerait cette expérience ?",
        he: "מכירים מישהו שיאהב את החוויה הזאת?"
      },
      shareButton: {
        en: "Share this experience",
        fr: "Partager cette expérience",
        he: "שתפו את החוויה"
      }
    };
    return texts[key]?.[lang] || texts[key]?.en || key;
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    // On mobile, try native share first
    if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: title,
          url: url,
        });
        return;
      } catch (err) {
        // User cancelled or error, fall through to dialog
      }
    }
    
    // Copy link and open share dialog
    navigator.clipboard.writeText(url);
    setShareDialogOpen(true);
  };

  return (
    <>
      <section className="py-8">
        <div className="rounded-2xl bg-gradient-to-br from-muted/40 via-background to-muted/30 border border-border/40 p-6 md:p-8 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary/10 via-muted/40 to-primary/5 mb-4">
            <Share2 className="h-6 w-6 text-primary/70" />
          </div>
          
          {/* Title */}
          <h3 className="font-serif text-xl md:text-2xl font-medium text-foreground mb-2">
            {getText('sectionTitle')}
          </h3>
          
          {/* Subtitle */}
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {getText('sectionSubtitle')}
          </p>
          
          {/* Share Button */}
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-full gap-2 px-6"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            {getText('shareButton')}
          </Button>
        </div>
      </section>

      {/* Share Dialog */}
      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        url={window.location.href}
        title={title}
        lang={lang}
      />
    </>
  );
};

export default ShareWithFriendsSection;
