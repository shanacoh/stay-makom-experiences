import { useQuery } from "@tanstack/react-query";

const FALLBACK_EUR_TO_ILS = 3.65;

interface FrankfurterResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export function useCurrencyRate() {
  const { data, isLoading } = useQuery<FrankfurterResponse>({
    queryKey: ["currency-rate-eur-ils"],
    queryFn: async () => {
      const res = await fetch("https://api.frankfurter.dev/v1/latest?from=EUR&to=ILS");
      if (!res.ok) throw new Error("Failed to fetch currency rate");
      return res.json();
    },
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 2,
  });

  const eurToIlsRate = data?.rates?.ILS ?? FALLBACK_EUR_TO_ILS;

  function convertPrice(amount: number, fromCurrency: string, toCurrency: string): number {
    const from = fromCurrency.toUpperCase();
    const to = toCurrency.toUpperCase();
    if (from === to) return amount;
    if (from === "EUR" && to === "ILS") return amount * eurToIlsRate;
    if (from === "ILS" && to === "EUR") return amount / eurToIlsRate;
    // Unsupported pair — return as-is
    return amount;
  }

  return { eurToIlsRate, isLoading, convertPrice };
}
