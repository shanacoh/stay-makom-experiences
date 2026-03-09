import * as amplitude from "@amplitude/analytics-browser";
import { sessionReplayPlugin } from "@amplitude/plugin-session-replay-browser";

let isInitialized = false;

export const initAmplitude = () => {
  if (isInitialized) return;

  const apiKey = import.meta.env.VITE_AMPLITUDE_API_KEY;
  if (!apiKey) {
    console.warn("[Amplitude] API key not found — skipping init");
    return;
  }

  const sessionReplay = sessionReplayPlugin({
    sampleRate: 1,
    privacyConfig: {
      maskSelector: [
        'input[name="email"]',
        'input[name="phone"]',
        'input[name="first_name"]',
        'input[name="last_name"]',
        'input[name="city"]',
        'input[type="password"]',
        'input[type="tel"]',
        'input[autocomplete="cc-number"]',
      ],
    },
  });

  amplitude.add(sessionReplay);

  amplitude.init(apiKey, {
    defaultTracking: false,
    autocapture: { elementInteractions: false },
  });

  isInitialized = true;

  // Capture UTMs on first load
  captureUtmParamsInternal();
};

export const isAmplitudeReady = () => isInitialized;

function captureUtmParamsInternal() {
  if (localStorage.getItem("staymakom_utm")) return;
  const params = new URLSearchParams(window.location.search);
  const utm = {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
  };
  if (utm.utm_source || utm.utm_medium || utm.utm_campaign) {
    localStorage.setItem("staymakom_utm", JSON.stringify(utm));
    amplitude.track("utm_captured", utm);
  }
}
