"use client";

import { useEffect, useState } from "react";

// Deterministic pseudo-random based on index
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

export default function AnimatedBackground() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Generate cells with ~8% having pulse animation
  const cells = Array.from({ length: 1152 }).map((_, i) => {
    const rand = seededRandom(i);
    const isAnimated = isClient && rand < 0.08;
    const delay = isAnimated ? seededRandom(i + 1000) * 8 : 0;
    return { id: i, isAnimated, delay };
  });

  return (
    <div className="absolute inset-0 overflow-hidden bg-background">
      {/* Grid of squares with animated pulse effect */}
      <div className="grid h-full w-full grid-cols-24 gap-0 md:grid-cols-36 lg:grid-cols-48 opacity-70">
        {cells.map((cell) => (
          <div
            key={cell.id}
            className={`relative aspect-square border border-primary/5 ${
              cell.isAnimated ? "pulse-cell" : ""
            }`}
            style={
              cell.isAnimated
                ? { animationDelay: `${cell.delay}s` }
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
