"use client";

import { useEffect, useRef } from "react";

// Define movement directions
const movements = [
  { x: -50, y: 0 },   // left
  { x: 50, y: 0 },    // right
  { x: 0, y: -50 },   // up
  { x: 0, y: 50 },    // down
  { x: -35, y: -35 }, // diagonal up-left
  { x: 35, y: -35 },  // diagonal up-right
  { x: -35, y: 35 },  // diagonal down-left
  { x: 35, y: 35 },   // diagonal down-right
];

export default function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const particles = containerRef.current.querySelectorAll(".particle-dot");

    particles.forEach((particle) => {
      const randomDelay = Math.random() * 10;
      const randomDuration = 15 + Math.random() * 5;
      const randomMovement = movements[Math.floor(Math.random() * movements.length)];

      const randomX = Math.random() * 100;
      const randomY = Math.random() * 100;

      const element = particle as HTMLElement;
      element.style.left = `${randomX}%`;
      element.style.top = `${randomY}%`;
      element.style.animationDelay = `${randomDelay}s`;
      element.style.animationDuration = `${randomDuration}s`;
      element.style.setProperty('--move-x', `${randomMovement.x}px`);
      element.style.setProperty('--move-y', `${randomMovement.y}px`);
    });
  }, []);

  return (
    <>
      <div ref={containerRef} className="absolute inset-0 overflow-hidden">
        {/* Grid of squares */}
        <div className="grid h-full w-full grid-cols-24 gap-0 md:grid-cols-36 lg:grid-cols-48">
          {Array.from({ length: 1152 }).map((_, i) => (
            <div
              key={`square-${i}`}
              className="relative aspect-square border border-primary/12"
            />
          ))}
        </div>

        {/* Floating particle dots */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`particle-${i}`}
              className="particle-dot"
            />
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes particleFloat {
          0%, 100% {
            transform: translate(0, 0);
            opacity: 0.3;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          50% {
            transform: translate(var(--move-x, 30px), var(--move-y, 30px));
          }
        }

        .particle-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: radial-gradient(circle, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.6) 50%, transparent 100%);
          box-shadow:
            0 0 15px 3px hsl(var(--primary) / 0.8),
            0 0 25px 6px hsl(var(--primary) / 0.4),
            0 0 35px 8px hsl(var(--primary) / 0.2);
          animation: particleFloat 18s ease-in-out infinite;
          will-change: transform, opacity;
          opacity: 0.3;
        }

        @media (prefers-reduced-motion: reduce) {
          .particle-dot {
            animation: none !important;
            opacity: 0.3;
          }
        }
      `}</style>
    </>
  );
}
