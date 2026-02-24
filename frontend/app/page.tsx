'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';

const PARTICLE_COLORS = ['#6C5CE7', '#a29bfe', '#3B82F6', '#22C55E', '#FBBF24'];

type Particle = {
  id: number;
  width: number;
  height: number;
  left: number;
  top: number;
  color: string;
  duration: number;
  delay: number;
  opacity: number;
};

export default function SplashPage() {
  const router = useRouter();
  const [phase, setPhase] = useState(0); // 0=init, 1=logo, 2=title, 3=fadeout
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        width: Math.random() * 4 + 2,
        height: Math.random() * 4 + 2,
        left: Math.random() * 100,
        top: Math.random() * 100,
        color: PARTICLE_COLORS[i % 5],
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 2,
        opacity: 0.4 + Math.random() * 0.3,
      }))
    );
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 900);
    const t3 = setTimeout(() => setPhase(3), 2200);
    const t4 = setTimeout(() => {
      const user = storage.user.get();
      if (user && user.onboardingCompleted) {
        router.replace('/home');
      } else {
        router.replace('/onboarding');
      }
    }, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [router]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center overflow-hidden relative"
      style={{
        opacity: phase >= 3 ? 0 : 1,
        transition: 'opacity 0.6s ease-out',
      }}
    >
      {/* Animated background particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.width,
            height: p.height,
            left: `${p.left}%`,
            top: `${p.top}%`,
            backgroundColor: p.color,
            opacity: phase >= 1 ? p.opacity : 0,
            animation: `float ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
            transition: 'opacity 1s ease-out',
          }}
        />
      ))}

      {/* Orbiting rings */}
      <div className="absolute" style={{ width: 200, height: 200, opacity: phase >= 1 ? 0.15 : 0, transition: 'opacity 1s' }}>
        <div className="absolute inset-0 rounded-full border border-[#6C5CE7] animate-sparkle-spin" />
        <div className="absolute inset-4 rounded-full border border-[#a29bfe]/50 animate-sparkle-spin" style={{ animationDirection: 'reverse', animationDuration: '8s' }} />
      </div>

      {/* Logo */}
      <div
        className="relative z-10 flex flex-col items-center gap-5"
        style={{
          transform: phase >= 1 ? 'scale(1)' : 'scale(0.3)',
          opacity: phase >= 1 ? 1 : 0,
          transition: 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Main icon with glow */}
        <div className="relative">
          <div
            className="w-28 h-28 rounded-[2rem] flex items-center justify-center relative z-10 animate-pulse-glow"
            style={{ background: 'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 50%, #6C5CE7 100%)' }}
          >
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.912 5.813a2 2 0 001.272 1.272L21 12l-5.813 1.912a2 2 0 00-1.272 1.272L12 21l-1.912-5.813a2 2 0 00-1.272-1.272L3 12l5.813-1.912a2 2 0 001.272-1.272L12 3z" />
            </svg>
          </div>
          {/* Orbiting mini icons */}
          <div className="absolute inset-0 animate-orbit" style={{ animationDuration: '8s' }}>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{ backgroundColor: '#3B82F6', marginTop: -3, marginLeft: -3 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7z" /></svg>
            </div>
          </div>
          <div className="absolute inset-0 animate-orbit-reverse" style={{ animationDuration: '10s' }}>
            <div className="w-5 h-5 rounded-md flex items-center justify-center text-xs" style={{ backgroundColor: '#FBBF24', marginTop: -2, marginLeft: -2 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" /></svg>
            </div>
          </div>
        </div>

        {/* Title with stagger */}
        <div
          className="text-center space-y-2"
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? 'translateY(0)' : 'translateY(15px)',
            transition: 'all 0.6s ease-out',
          }}
        >
          <h1 className="text-4xl font-extrabold tracking-tight" style={{ background: 'linear-gradient(135deg, #fff 30%, #a29bfe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            DreamPath
          </h1>
          <p className="text-sm tracking-widest uppercase" style={{ color: '#a29bfe' }}>
            Career RPG Adventure
          </p>
        </div>
      </div>

      {/* Loading bar at bottom */}
      <div className="absolute bottom-16 w-32 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
        <div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #6C5CE7, #a29bfe)',
            width: phase >= 1 ? '100%' : '0%',
            transition: 'width 2s ease-in-out',
          }}
        />
      </div>
    </div>
  );
}
