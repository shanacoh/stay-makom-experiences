/**
 * HyperGuest Error Handler
 * Displays user-friendly error messages instead of raw technical errors
 * Supports EN, FR, HE
 */

import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Search, RefreshCw, WifiOff, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HGErrorProps {
  error: any;
  onRetry?: () => void;
  lang?: 'fr' | 'en' | 'he';
  className?: string;
}

const ERROR_MESSAGES = {
  EDGE_DOWN: {
    fr: 'Service temporairement indisponible',
    en: 'Service temporarily unavailable',
    he: 'השירות אינו זמין זמנית',
    sub: {
      fr: 'Nos serveurs sont en maintenance. Réessayez dans quelques minutes.',
      en: 'Our servers are under maintenance. Please try again in a few minutes.',
      he: 'השרתים שלנו בתחזוקה. נסו שוב בעוד מספר דקות.',
    },
    icon: WifiOff,
  },
  AUTH_ERROR: {
    fr: "Erreur d'authentification",
    en: 'Authentication error',
    he: 'שגיאת אימות',
    sub: {
      fr: 'Un problème technique est survenu. Notre équipe a été notifiée.',
      en: 'A technical issue occurred. Our team has been notified.',
      he: 'אירעה בעיה טכנית. הצוות שלנו קיבל התראה.',
    },
    icon: ShieldAlert,
  },
  NO_ROOMS: {
    fr: 'Aucune chambre disponible',
    en: 'No rooms available',
    he: 'אין חדרים זמינים',
    sub: {
      fr: 'Essayez de modifier vos dates ou le nombre de voyageurs.',
      en: 'Try changing your dates or number of guests.',
      he: 'נסו לשנות את התאריכים או מספר האורחים.',
    },
    icon: Search,
  },
  HG_DOWN: {
    fr: 'Le système de réservation est temporairement indisponible',
    en: 'The booking system is temporarily unavailable',
    he: 'מערכת ההזמנות אינה זמינה זמנית',
    sub: {
      fr: 'Veuillez réessayer dans quelques minutes.',
      en: 'Please try again in a few minutes.',
      he: 'אנא נסו שוב בעוד מספר דקות.',
    },
    icon: AlertTriangle,
  },
  BOOKING_FAIL: {
    fr: "La réservation n'a pas pu être finalisée",
    en: 'The booking could not be completed',
    he: 'לא ניתן להשלים את ההזמנה',
    sub: {
      fr: "La chambre n'est peut-être plus disponible. Veuillez relancer une recherche.",
      en: 'The room may no longer be available. Please try a new search.',
      he: 'ייתכן שהחדר כבר לא זמין. אנא נסו חיפוש חדש.',
    },
    icon: AlertTriangle,
  },
  TIMEOUT: {
    fr: 'La requête a pris trop de temps',
    en: 'The request took too long',
    he: 'הבקשה ארכה זמן רב מדי',
    sub: {
      fr: 'Vérifiez votre connexion internet et réessayez.',
      en: 'Check your internet connection and try again.',
      he: 'בדקו את חיבור האינטרנט ונסו שוב.',
    },
    icon: Clock,
  },
  GENERIC: {
    fr: 'Une erreur est survenue',
    en: 'An error occurred',
    he: 'אירעה שגיאה',
    sub: {
      fr: 'Veuillez réessayer. Si le problème persiste, contactez-nous.',
      en: 'Please try again. If the problem persists, contact us.',
      he: 'אנא נסו שוב. אם הבעיה נמשכת, צרו איתנו קשר.',
    },
    icon: AlertTriangle,
  },
};

type ErrorType = keyof typeof ERROR_MESSAGES;

export function classifyHGError(error: any): ErrorType {
  const errorStr = JSON.stringify(error || '').toLowerCase();

  if (
    errorStr.includes('failed to fetch') ||
    errorStr.includes('networkerror') ||
    errorStr.includes('edge function') ||
    errorStr.includes('function invocation failed')
  ) {
    return 'EDGE_DOWN';
  }
  if (
    errorStr.includes('401') ||
    errorStr.includes('403') ||
    errorStr.includes('unauthorized') ||
    errorStr.includes('forbidden')
  ) {
    return 'AUTH_ERROR';
  }
  if (errorStr.includes('sn.5') || errorStr.includes('500') || errorStr.includes('503')) {
    return 'HG_DOWN';
  }
  if (errorStr.includes('timeout') || errorStr.includes('abort') || errorStr.includes('aborted')) {
    return 'TIMEOUT';
  }
  if (
    errorStr.includes('bn.402') ||
    errorStr.includes('bn.506') ||
    errorStr.includes('bn.507') ||
    errorStr.includes('price') ||
    errorStr.includes('no longer available')
  ) {
    return 'BOOKING_FAIL';
  }
  if (errorStr.includes('no rooms') || errorStr.includes('0 rooms')) {
    return 'NO_ROOMS';
  }
  return 'GENERIC';
}

export function HyperGuestError({ error, onRetry, lang = 'fr', className }: HGErrorProps) {
  const errorType = classifyHGError(error);
  const msg = ERROR_MESSAGES[errorType];
  const Icon = msg.icon;

  const retryLabel = { fr: 'Réessayer', en: 'Try again', he: 'נסו שוב' }[lang];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-6 rounded-xl border border-border bg-card',
        className
      )}
      dir={lang === 'he' ? 'rtl' : 'ltr'}
    >
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-destructive" />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">{msg[lang]}</h3>

      <p className="text-sm text-muted-foreground max-w-sm">{msg.sub[lang]}</p>

      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

export default HyperGuestError;
