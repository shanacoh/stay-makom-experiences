import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Mail } from "lucide-react";

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

  const truncatedUrl = url.length > 40 ? url.substring(0, 40) + '...' : url;

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
      <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="text-center font-serif text-xl">
            {t.shareTitle}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* URL Field with Copied indicator */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border">
            <span className="flex-1 text-sm text-muted-foreground truncate font-mono">
              {truncatedUrl}
            </span>
            <span className="flex items-center gap-1 text-sm text-green-600 font-medium whitespace-nowrap">
              <Check className="h-4 w-4" />
              {t.copied}
            </span>
          </div>

          {/* Share Buttons */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={handleEmailShare}
            >
              <Mail className="h-5 w-5" />
              {t.email}
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={handleMessengerShare}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.906 1.453 5.502 3.726 7.2V22l3.405-1.868c.908.252 1.871.388 2.869.388 5.523 0 10-4.145 10-9.243S17.523 2 12 2zm.994 12.468l-2.547-2.72-4.973 2.72 5.47-5.806 2.612 2.72 4.907-2.72-5.47 5.806z"/>
              </svg>
              {t.messenger}
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={handleWhatsAppShare}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {t.whatsapp}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
