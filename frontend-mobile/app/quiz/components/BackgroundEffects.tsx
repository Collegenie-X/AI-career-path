interface BackgroundEffectsProps {
  color: string;
}

export function BackgroundEffects({ color }: BackgroundEffectsProps) {
  return (
    <>
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full blur-[100px] transition-colors duration-700"
        style={{ backgroundColor: `${color}20` }}
      />

      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 3 + (i % 3),
            height: 3 + (i % 3),
            left: `${8 + i * 11}%`,
            top: `${10 + (i * 17) % 80}%`,
            backgroundColor: color,
            opacity: 0.12 + (i % 3) * 0.04,
            animation: `float ${4 + i * 0.7}s ease-in-out ${i * 0.3}s infinite`,
          }}
        />
      ))}
    </>
  );
}
