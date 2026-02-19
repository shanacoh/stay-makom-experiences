import { useQuery } from "@tanstack/react-query";

const FALLBACK_EUR_TO_ILS = 3.65;
const FALLBACK_EUR_TO_USD = 1.08;

interface FrankfurterResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export function useCurrencyRate() {
  const { data, isLoading } = useQuery<FrankfurterResponse>({
    queryKey: ["currency-rate-eur-multi"],
    queryFn: async () => {
      const res = await fetch("https://api.frankfurter.dev/v1/latest?from=EUR&to=ILS,USD");
      if (!res.ok) throw new Error("Failed to fetch currency rate");
      return res.json();
    },
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 2,
  });

  const eurToIlsRate = data?.rates?.ILS ?? FALLBACK_EUR_TO_ILS;
  const eurToUsdRate = data?.rates?.USD ?? FALLBACK_EUR_TO_USD;

  function convertPrice(amount: number, fromCurrency: string, toCurrency: string): number {
    const from = fromCurrency.toUpperCase();
    const to = toCurrency.toUpperCase();
    if (from === to) return amount;

    // Normalise to EUR first, then convert to target
    let amountInEur = amount;
    if (from === "ILS") amountInEur = amount / eurToIlsRate;
    else if (from === "USD") amountInEur = amount / eurToUsdRate;
    // from === "EUR" → already in EUR

    if (to === "EUR") return amountInEur;
    if (to === "ILS") return amountInEur * eurToIlsRate;
    if (to === "USD") return amountInEur * eurToUsdRate;

    return amount;
  }

  return { eurToIlsRate, eurToUsdRate, isLoading, convertPrice };
}
