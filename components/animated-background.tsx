"use client";

export default function AnimatedBackground() {
  // Create lines at different positions
  const lines = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    position: (i * 3.33) + 5,
    isHorizontal: i % 2 === 0,
    delay: i * 0.15,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden bg-background">
      {/* Grid of squares with reduced opacity */}
      <div className="grid h-full w-full grid-cols-24 gap-0 md:grid-cols-36 lg:grid-cols-48 opacity-70">
        {Array.from({ length: 1152 }).map((_, i) => (
          <div
            key={i}
            className="relative aspect-square border border-primary/5"
          />
        ))}
      </div>
    </div>
  );
}
