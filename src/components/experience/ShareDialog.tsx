import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Check } from "lucide-react";
import { ShareNetwork, EnvelopeSimple, MessengerLogo, WhatsappLogo } from "@phosphor-icons/react";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title: string;
  lang: 'en' | 'he' | 'fr';
}

const ShareDialog = ({ open, onOpenChange, url, title, lang }: ShareDialogProps) => {
  const isRTL = lang === 'he';
  
  const translations = {
    en: {
      shareTitle: "Share this experience",
      copied: "Copied",
      email: "Email",
      messenger: "Messenger",
      whatsapp: "WhatsApp",
    },
    he: {
      shareTitle: "שתפו את החוויה",
      copied: "הועתק",
      email: "אימייל",
      messenger: "מסנג'ר",
      whatsapp: "וואטסאפ",
    },
    fr: {
      shareTitle: "Partager cette expérience",
      copied: "Copié",
      email: "Email",
      messenger: "Messenger",
      whatsapp: "WhatsApp",
    },
  };

  const t = translations[lang];

  const truncatedUrl = url.length > 35 ? url.substring(0, 35) + '...' : url;

  const handleEmailShare = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${title}\n\n${url}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleMessengerShare = () => {
    const encodedUrl = encodeURIComponent(url);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank', 'width=600,height=400');
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`${title} ${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[calc(100vw-2rem)] sm:max-w-[320px] rounded-2xl p-0 overflow-hidden border-0 shadow-2xl"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header with decorative icon */}
        <div className="pt-8 pb-4 px-5 text-center bg-gradient-to-b from-muted/50 to-transparent">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/5 via-muted/30 to-primary/10 mb-4">
            <ShareNetwork size={28} weight="duotone" className="text-primary/70" />
          </div>
          <h2 className="font-serif text-2xl text-foreground">
            {t.shareTitle}
          </h2>
        </div>
        
        <div className="px-5 pb-6 space-y-4">
          {/* URL Field with Copied indicator */}
          <div className="flex items-center gap-2 p-2.5 bg-muted/60 rounded-xl border border-border/50">
            <span className="flex-1 text-sm text-muted-foreground truncate">
              {truncatedUrl}
            </span>
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium whitespace-nowrap bg-green-50 px-2 py-1 rounded-full">
              <Check className="h-3 w-3" />
              {t.copied}
            </span>
          </div>

          {/* Share Buttons - Grid layout */}
          <div className="grid grid-cols-3 gap-2">
            {/* Email */}
            <button
              onClick={handleEmailShare}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200 hover:scale-[1.02] group"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/5 via-muted/30 to-primary/10 flex items-center justify-center group-hover:from-primary/10 group-hover:to-primary/20 transition-all">
                <EnvelopeSimple size={22} weight="duotone" className="text-primary/60" />
              </div>
              <span className="text-xs font-medium text-foreground/70">
                {t.email}
              </span>
            </button>

            {/* Messenger */}
            <button
              onClick={handleMessengerShare}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200 hover:scale-[1.02] group"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/5 via-muted/30 to-primary/10 flex items-center justify-center group-hover:from-primary/10 group-hover:to-primary/20 transition-all">
                <MessengerLogo size={22} weight="duotone" className="text-primary/60" />
              </div>
              <span className="text-xs font-medium text-foreground/70">
                {t.messenger}
              </span>
            </button>

            {/* WhatsApp */}
            <button
              onClick={handleWhatsAppShare}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200 hover:scale-[1.02] group"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/5 via-muted/30 to-primary/10 flex items-center justify-center group-hover:from-primary/10 group-hover:to-primary/20 transition-all">
                <WhatsappLogo size={22} weight="duotone" className="text-primary/60" />
              </div>
              <span className="text-xs font-medium text-foreground/70">
                {t.whatsapp}
              </span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
