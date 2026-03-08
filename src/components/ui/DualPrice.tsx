import { useCurrencyRate } from "@/hooks/useCurrencyRate";
import { cn } from "@/lib/utils";

interface DualPriceProps {
  amount: number;
  currency: string;
  className?: string;
  showSecondary?: boolean;
  reverse?: boolean;
  /** Compact inline mode (e.g. for table rows) */
  inline?: boolean;
}

function formatCurrency(amount: number, currency: string, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

/** Show the original currency as primary. No secondary conversion for user-facing pages. */
function getDisplayCurrencies(currency: string): { primaryCur: string; secondaryCur: string | null } {
  return { primaryCur: currency.toUpperCase(), secondaryCur: null };
}

export function DualPrice({
  amount,
  currency,
  className,
  showSecondary = true,
  reverse = false,
  inline = false,
}: DualPriceProps) {
  const { convertPrice } = useCurrencyRate();
  const { primaryCur, secondaryCur } = getDisplayCurrencies(currency);

  const primaryAmount = primaryCur === currency.toUpperCase()
    ? amount
    : convertPrice(amount, currency, primaryCur);
  const secondaryAmount = secondaryCur ? convertPrice(amount, currency, secondaryCur) : null;

  const primaryFormatted = formatCurrency(primaryAmount, primaryCur);
  const secondaryFormatted = secondaryAmount != null && secondaryCur ? formatCurrency(secondaryAmount, secondaryCur) : null;

  if (!showSecondary || !secondaryFormatted) {
    return <span className={className}>{primaryFormatted}</span>;
  }

  if (inline) {
    return (
      <span className={cn("inline-flex items-baseline gap-1.5", className)}>
        <span className="font-bold">{primaryFormatted}</span>
        <span className="text-xs text-muted-foreground">({secondaryFormatted})</span>
      </span>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <span className="font-bold">{primaryFormatted}</span>
      <span className="text-xs text-muted-foreground">
        soit {secondaryFormatted}
      </span>
    </div>
  );
}

/** Small helper for admin: shows "≈ XX €" next to an input */
export function ConvertedHint({
  amount,
  fromCurrency,
  toCurrency,
  className,
}: {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  className?: string;
}) {
  const { convertPrice } = useCurrencyRate();
  if (!amount || fromCurrency.toUpperCase() === toCurrency.toUpperCase()) return null;
  const converted = convertPrice(amount, fromCurrency, toCurrency);
  return (
    <span className={cn("text-xs text-muted-foreground whitespace-nowrap", className)}>
      ≈ {formatCurrency(converted, toCurrency)}
    </span>
  );
}