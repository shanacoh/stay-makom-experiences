/**
 * Cancellation Policy Analyzer
 * Parses raw HyperGuest cancellationPolicies[] and returns structured info
 */

export interface RawCancellationPolicy {
  daysBefore?: number;
  penaltyType?: string; // "percent" | "currency" | "nights"
  amount?: number;
  timeSetting?: {
    timeFromCheckIn?: number;
    timeFromCheckInType?: string; // "days" | "hours"
  };
  cancellationDeadlineHour?: string; // "HH:mm"
}

export interface CancellationAnalysis {
  isFreeCancellation: boolean;
  isNonRefundable: boolean;
  effectiveDeadline: Date | null;
  penalties: {
    daysBefore: number;
    penaltyType: string;
    amount: number;
    description: string;
  }[];
  summaryText: string;
}

type Lang = "en" | "he" | "fr";

/**
 * Calculate the effective cancellation deadline.
 * Formula: checkInDate at cancellationDeadlineHour minus timeFromCheckIn (hours or days)
 */
function calcDeadline(
  checkInDate: string,
  deadlineHour: string | undefined,
  timeSetting: RawCancellationPolicy["timeSetting"]
): Date | null {
  if (!checkInDate) return null;

  const checkIn = new Date(checkInDate + "T00:00:00");
  if (isNaN(checkIn.getTime())) return null;

  // Apply deadline hour (e.g. "19:00")
  if (deadlineHour) {
    const [h, m] = deadlineHour.split(":").map(Number);
    if (!isNaN(h)) checkIn.setHours(h, m || 0, 0, 0);
  }

  // Subtract timeFromCheckIn
  if (timeSetting?.timeFromCheckIn != null && timeSetting.timeFromCheckIn > 0) {
    if (timeSetting.timeFromCheckInType === "hours") {
      checkIn.setTime(checkIn.getTime() - timeSetting.timeFromCheckIn * 60 * 60 * 1000);
    } else {
      // default: days
      checkIn.setDate(checkIn.getDate() - timeSetting.timeFromCheckIn);
    }
  }

  return checkIn;
}

function formatDeadline(date: Date, lang: Lang): string {
  const locale = lang === "he" ? "he-IL" : lang === "fr" ? "fr-FR" : "en-US";
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }) + " " + date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}

function penaltyDescription(p: RawCancellationPolicy, lang: Lang): string {
  const amount = p.amount ?? 0;
  switch (p.penaltyType) {
    case "nights":
      if (lang === "he") return `${amount} ${amount === 1 ? "לילה" : "לילות"} חיוב`;
      if (lang === "fr") return `${amount} nuit${amount > 1 ? "s" : ""} de pénalité`;
      return `${amount} night${amount > 1 ? "s" : ""} penalty`;
    case "percent":
      if (lang === "he") return `${amount}% מעלות השהייה`;
      if (lang === "fr") return `${amount}% du séjour total`;
      return `${amount}% of total stay`;
    case "currency":
      if (lang === "he") return `${amount} חיוב`;
      if (lang === "fr") return `${amount} de pénalité`;
      return `${amount} penalty`;
    default:
      return `${amount}`;
  }
}

export function analyzeCancellationPolicies(
  policies: RawCancellationPolicy[] | undefined | null,
  checkInDate: string | undefined | null,
  lang: Lang = "en"
): CancellationAnalysis {
  const empty: CancellationAnalysis = {
    isFreeCancellation: false,
    isNonRefundable: false,
    effectiveDeadline: null,
    penalties: [],
    summaryText: "",
  };

  if (!policies || policies.length === 0) {
    // No policies = unknown, don't claim free
    return empty;
  }

  // Detect non-refundable: daysBefore >= 999 & amount === 100 & penaltyType === "percent"
  const nonRefundable = policies.some(
    (p) => (p.daysBefore ?? 0) >= 999 && p.amount === 100 && p.penaltyType === "percent"
  );

  if (nonRefundable) {
    const text =
      lang === "he" ? "לא ניתן לביטול" :
      lang === "fr" ? "Non remboursable" :
      "Non-refundable";
    return {
      isFreeCancellation: false,
      isNonRefundable: true,
      effectiveDeadline: null,
      penalties: policies.map((p) => ({
        daysBefore: p.daysBefore ?? 0,
        penaltyType: p.penaltyType ?? "percent",
        amount: p.amount ?? 0,
        description: penaltyDescription(p, lang),
      })),
      summaryText: text,
    };
  }

  // Find the most relevant policy for free cancellation deadline
  // Sort by daysBefore descending to find the earliest applicable rule
  const sorted = [...policies].sort((a, b) => (b.daysBefore ?? 0) - (a.daysBefore ?? 0));

  // Find deadline from the first policy that has timing info
  let deadline: Date | null = null;
  for (const p of sorted) {
    if (checkInDate && (p.timeSetting || p.cancellationDeadlineHour)) {
      deadline = calcDeadline(checkInDate, p.cancellationDeadlineHour, p.timeSetting);
      if (deadline) break;
    }
  }

  // If no specific timing, try to derive from daysBefore
  if (!deadline && checkInDate && sorted.length > 0) {
    const firstWithDays = sorted.find((p) => p.daysBefore != null && p.daysBefore < 999);
    if (firstWithDays) {
      const d = new Date(checkInDate + "T00:00:00");
      d.setDate(d.getDate() - (firstWithDays.daysBefore ?? 0));
      deadline = d;
    }
  }

  // Determine if currently free cancellation
  const now = new Date();
  const isFree = deadline ? now < deadline : policies.every((p) => (p.amount ?? 0) === 0);

  const penaltiesList = policies
    .filter((p) => (p.amount ?? 0) > 0 && (p.daysBefore ?? 0) < 999)
    .map((p) => ({
      daysBefore: p.daysBefore ?? 0,
      penaltyType: p.penaltyType ?? "percent",
      amount: p.amount ?? 0,
      description: penaltyDescription(p, lang),
    }));

  // Build summary text
  let summaryText = "";
  if (isFree && deadline) {
    const deadlineStr = formatDeadline(deadline, lang);
    summaryText =
      lang === "he" ? `ביטול חינם עד ${deadlineStr}` :
      lang === "fr" ? `Annulation gratuite jusqu'au ${deadlineStr}` :
      `Free cancellation until ${deadlineStr}`;
  } else if (isFree) {
    summaryText =
      lang === "he" ? "ביטול חינם" :
      lang === "fr" ? "Annulation gratuite" :
      "Free cancellation";
  } else if (penaltiesList.length > 0) {
    const penaltyStr = penaltiesList.map((p) => p.description).join("; ");
    summaryText =
      lang === "he" ? `תנאי ביטול: ${penaltyStr}` :
      lang === "fr" ? `Conditions d'annulation : ${penaltyStr}` :
      `Cancellation terms: ${penaltyStr}`;
  }

  return {
    isFreeCancellation: isFree,
    isNonRefundable: false,
    effectiveDeadline: deadline,
    penalties: penaltiesList,
    summaryText,
  };
}
