import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

interface HeartBurstProps {
  trigger: boolean;
  onComplete?: () => void;
}

const HEART_COUNT = 6;

export default function HeartBurst({ trigger, onComplete }: HeartBurstProps) {
  const [hearts, setHearts] = useState<Array<{ id: number; x: number; delay: number }>>([]);

  useEffect(() => {
    if (trigger) {
      // Generate random hearts
      const newHearts = Array.from({ length: HEART_COUNT }, (_, i) => ({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 40, // Random horizontal spread
        delay: Math.random() * 100, // Random delay up to 100ms
      }));
      setHearts(newHearts);

      // Clear hearts after animation
      const timeout = setTimeout(() => {
        setHearts([]);
        onComplete?.();
      }, 700);

      return () => clearTimeout(timeout);
    }
  }, [trigger, onComplete]);

  if (hearts.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {hearts.map((heart) => (
        <Heart
          key={heart.id}
          className="absolute left-1/2 top-1/2 h-3 w-3 fill-cta text-cta animate-heart-float"
          style={{
            '--float-x': `${heart.x}px`,
            animationDelay: `${heart.delay}ms`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
