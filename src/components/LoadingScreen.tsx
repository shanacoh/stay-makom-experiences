import { useState, useEffect } from "react";
import RotatingText from "./RotatingText";

const PHRASES = [
  "Slow down. We're almost there.",
  "Not a destination. A feeling.",
  "Some places change you.",
  "The best stays are never rushed.",
  "Travel less. Experience more.",
];

interface LoadingScreenProps {
  isLoading: boolean;
  minDuration?: number;
}

const LoadingScreen = ({ isLoading, minDuration = 300 }: LoadingScreenProps) => {
  const [visible, setVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [loadStart] = useState(Date.now());

  useEffect(() => {
    let showTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;

    if (isLoading) {
      // Only show after minDuration ms
      showTimer = setTimeout(() => {
        setShouldRender(true);
        requestAnimationFrame(() => setVisible(true));
      }, minDuration);
    } else {
      // Fade out
      setVisible(false);
      hideTimer = setTimeout(() => setShouldRender(false), 500);
    }

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [isLoading, minDuration]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ backgroundColor: "#F5F0E8" }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center gap-6">
        <span
          className="text-2xl md:text-3xl tracking-[0.35em] uppercase font-light select-none"
          style={{ color: "hsl(207, 62%, 15%)", fontFamily: "Inter, system-ui, sans-serif" }}
        >
          STAYMAKOM
        </span>

        {/* Rotating phrase */}
        <div className="h-6">
          <span
            className="text-xs tracking-[0.25em] uppercase font-light"
            style={{ color: "hsl(23, 10%, 15%, 0.5)", fontFamily: "Inter, system-ui, sans-serif" }}
          >
            <RotatingText words={PHRASES} interval={2800} />
          </span>
        </div>
      </div>

      {/* Thin progress bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
        <div
          className="h-full animate-pulse"
          style={{
            backgroundColor: "hsl(207, 62%, 15%, 0.2)",
            animation: "loading-slide 2.5s ease-in-out infinite",
          }}
        />
      </div>

      <style>{`
        @keyframes loading-slide {
          0% { width: 0%; margin-left: 0; }
          50% { width: 60%; margin-left: 20%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
