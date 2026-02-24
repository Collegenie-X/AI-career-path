'use client';

export function BackgroundEffects() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Gradient Orbs */}
      <div
        className="absolute -top-40 -left-40 w-80 h-80 rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(108,92,231,0.4) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute top-1/3 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute -bottom-40 left-1/4 w-80 h-80 rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)',
        }}
      />

      {/* Animated Stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }, (_, i) => {
          const x = (i * 137.5) % 100;
          const y = (i * 97.3) % 100;
          const size = (i % 3) + 1;
          const delay = (i * 0.4) % 4;
          const duration = 2 + (i % 3);

          return (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: size,
                height: size,
                opacity: 0.2,
                animation: `twinkle ${duration}s ease-in-out ${delay}s infinite`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
