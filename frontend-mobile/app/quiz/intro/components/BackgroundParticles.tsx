import { ANIMATION_CONFIG } from '../config';

export function BackgroundParticles() {
  return (
    <>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 20%, rgba(108,92,231,0.12) 0%, transparent 60%)' }} />
      {Array.from({ length: ANIMATION_CONFIG.particleCount }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-float"
          style={{
            width: 3 + Math.random() * 3,
            height: 3 + Math.random() * 3,
            left: `${15 + Math.random() * 70}%`,
            top: `${10 + Math.random() * 80}%`,
            backgroundColor: '#6C5CE7',
            opacity: 0.2,
            animationDuration: `${3 + Math.random() * 3}s`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </>
  );
}
