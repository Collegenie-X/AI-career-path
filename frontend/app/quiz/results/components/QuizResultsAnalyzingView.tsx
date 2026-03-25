'use client';

import { Orbit } from 'lucide-react';
import { StarfieldCanvas } from '@/components/shared/StarfieldCanvas';

interface QuizResultsAnalyzingViewProps {
  accentColor: string;
  message: string;
}

export function QuizResultsAnalyzingView({ accentColor, message }: QuizResultsAnalyzingViewProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-black">
      <StarfieldCanvas count={150} />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-8">
          <div
            className="w-40 h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center animate-pulse-glow"
            style={{
              background: `radial-gradient(circle, ${accentColor}40 0%, ${accentColor}10 60%, transparent 70%)`,
            }}
          >
            <Orbit className="w-20 h-20 md:w-24 md:h-24 text-white animate-sparkle-spin" style={{ animationDuration: '3s' }} />
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="absolute inset-0 flex items-center justify-center">
              <div className="animate-orbit" style={{ animationDuration: `${3 + i * 1.5}s`, animationDelay: `${i * 0.5}s` }}>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: accentColor, boxShadow: `0 0 12px ${accentColor}` }} />
              </div>
            </div>
          ))}
        </div>

        <p className="text-white/60 text-lg md:text-xl font-semibold animate-pulse">{message}</p>
        <div className="flex gap-2 mt-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: accentColor,
                animation: 'float 1s ease-in-out infinite',
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
