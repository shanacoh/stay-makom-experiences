import { useState } from "react";
import { Share2 } from "lucide-react";
import ShareDialog from "./ShareDialog";

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
      shareBtn: {
        en: "Share this escape",
        fr: "Partager cette escapade",
        he: "שתפו את הבריחה"
      }
    };
    return texts[key]?.[lang] || texts[key]?.en || key;
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
      try {
        await navigator.share({ title, url });
        return;
      } catch { /* fall through */ }
    }
    try { await navigator.clipboard.writeText(url); } catch {}
    setShareDialogOpen(true);
  };

  return (
    <>
      <section className="py-6">
        <p className="text-[15px] md:text-sm text-muted-foreground inline">
          {getText('prompt')}{" "}
        </p>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-[15px] md:text-sm text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground transition-colors"
        >
          <Share2 className="h-3.5 w-3.5" />
          {getText('shareBtn')}
        </button>
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
