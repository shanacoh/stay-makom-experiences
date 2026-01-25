import { useState } from "react";
import { Share2 } from "lucide-react";
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
      prompt: {
        en: "Know someone who'd love this?",
        fr: "Quelqu'un aimerait cette expérience ?",
        he: "מכירים מישהו שיאהב?"
      },
      shareLink: {
        en: "Share",
        fr: "Partager",
        he: "שתפו"
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
      <section className="py-4">
        <div className="flex items-center justify-start gap-2 text-sm text-foreground/60">
          <span>{getText('prompt')}</span>
          <button 
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 font-medium transition-colors"
          >
            <Share2 className="h-3.5 w-3.5" />
            {getText('shareLink')}
          </button>
        </div>
      </section>

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
