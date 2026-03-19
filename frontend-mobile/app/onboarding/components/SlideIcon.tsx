'use client';

import type { LucideIcon } from 'lucide-react';
import type { OnboardingFloatingIcon } from '../types';

interface SlideIconProps {
  icon: LucideIcon;
  color: string;
  colorLight: string;
  floatingIcons: OnboardingFloatingIcon[];
  slideIndex: number;
}

export function SlideIcon({
  icon: Icon,
  color,
  colorLight,
  floatingIcons,
  slideIndex,
}: SlideIconProps) {
  return (
    <>
      {/* Floating decorative icons */}
      {floatingIcons.map((fi, i) => (
        <div
          key={`fi-${slideIndex}-${i}`}
          className="absolute animate-float"
          style={{
            left: fi.x,
            top: fi.y,
            fontSize: fi.size,
            animationDuration: `${3 + i}s`,
            animationDelay: `${fi.delay}s`,
            opacity: 0.5,
          }}
        >
          {fi.icon}
        </div>
      ))}

      {/* Central icon with animated rings */}
      <div className="relative mb-8">
        {/* Outer ring */}
        <div
          className="absolute -inset-6 rounded-full animate-sparkle-spin"
          style={{ border: `2px dashed ${color}40`, animationDuration: '12s' }}
        />
        {/* Middle ring */}
        <div
          className="absolute -inset-3 rounded-full animate-sparkle-spin"
          style={{
            border: `1px solid ${color}25`,
            animationDuration: '8s',
            animationDirection: 'reverse',
          }}
        />
        {/* Main icon container */}
        <div
          className="w-28 h-28 rounded-[2rem] flex items-center justify-center relative z-10 animate-scale-bounce"
          key={`icon-${slideIndex}`}
          style={{
            background: `linear-gradient(135deg, ${color} 0%, ${colorLight} 100%)`,
            boxShadow: `0 0 40px ${color}50, 0 20px 40px ${color}20`,
          }}
        >
          <Icon className="w-14 h-14 text-white" strokeWidth={1.5} />
        </div>
        {/* Orbiting dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-orbit" style={{ animationDuration: '6s' }}>
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: colorLight,
                boxShadow: `0 0 8px ${colorLight}`,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
