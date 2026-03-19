'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { XPBar } from '@/components/xp-bar';
import kingdomsData from '@/data/kingdoms.json';
import { Kingdom } from '@/lib/types';
import { Sparkles, Lock, Star, ChevronRight } from 'lucide-react';

export default function ExplorePage() {
  const router = useRouter();
  const [kingdoms] = useState<Kingdom[]>(kingdomsData as Kingdom[]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative overflow-hidden pb-20">
      {/* Animated Space Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ 
          background: 'radial-gradient(ellipse at 30% 20%, rgba(108,92,231,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(59,130,246,0.1) 0%, transparent 50%)'
        }} />
        
        {/* Floating Stars */}
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `twinkle ${Math.random() * 4 + 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: 0.4
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl border-b border-white/10" style={{ backgroundColor: 'rgba(26,26,46,0.85)' }}>
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-glow">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                별자리 탐험
              </h1>
              <p className="text-xs text-muted-foreground">8개의 직업 별을 발견하세요</p>
            </div>
          </div>
          <XPBar />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 py-6 space-y-6">
        {/* Star Map Title */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-2">
            <Star className="w-4 h-4 text-yellow-400 animate-sparkle-spin" />
            <span className="text-sm font-semibold">별자리 지도</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto text-balance">
            각 별은 고유한 직업 세계를 담고 있어요. 마음에 드는 별을 클릭해서 탐험을 시작하세요!
          </p>
        </div>

        {/* Star Grid */}
        <div className="grid grid-cols-2 gap-4">
          {kingdoms.map((kingdom, index) => (
            <StarCard
              key={kingdom.id}
              kingdom={kingdom}
              index={index}
              onClick={() => router.push(`/explore/${kingdom.id}`)}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-8 glass-card p-4 rounded-2xl">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            별 안내
          </h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary/50" />
              <span>탐구형(I): 분석과 연구를 좋아해요</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <span>예술형(A): 창의적 표현을 즐겨요</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500/50" />
              <span>실행형(R): 손으로 만들기를 좋아해요</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
              <span>사회형(S): 사람을 돕고 가르치길 원해요</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function StarCard({
  kingdom,
  index,
  onClick,
}: {
  kingdom: Kingdom;
  index: number;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative cursor-pointer group"
      style={{
        animation: `slide-up 0.6s ease-out ${index * 0.1}s both`
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Orbital Ring */}
      <div 
        className="absolute inset-0 rounded-3xl transition-all duration-300"
        style={{
          background: `conic-gradient(from 0deg, ${kingdom.color}00, ${kingdom.color}40, ${kingdom.color}00)`,
          transform: isHovered ? 'scale(1.1) rotate(180deg)' : 'scale(1.05) rotate(0deg)',
          opacity: isHovered ? 0.6 : 0.3
        }}
      />

      {/* Star Card */}
      <div 
        className="relative rounded-3xl overflow-hidden backdrop-blur-xl border border-white/10 transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, ${kingdom.bgColor}dd 0%, ${kingdom.bgColor}99 100%)`,
          transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
          boxShadow: isHovered ? `0 12px 32px -8px ${kingdom.color}60` : 'none'
        }}
      >
        {/* Shine Effect */}
        {isHovered && (
          <div 
            className="absolute inset-0 pointer-events-none animate-shimmer"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
              backgroundSize: '200% 100%'
            }}
          />
        )}

        <div className="relative p-4 h-48 flex flex-col">
          {/* Top Badge */}
          <div className="flex items-start justify-between mb-auto">
            <div 
              className="px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1"
              style={{ 
                backgroundColor: `${kingdom.color}30`,
                color: kingdom.color,
                border: `1px solid ${kingdom.color}50`
              }}
            >
              {kingdom.riasecTypes?.join('·')}
            </div>
            <ChevronRight 
              className="w-5 h-5 transition-transform group-hover:translate-x-1"
              style={{ color: kingdom.color }}
            />
          </div>

          {/* Star Icon */}
          <div className="flex justify-center mb-3">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center relative animate-float"
              style={{ 
                backgroundColor: `${kingdom.color}25`,
                boxShadow: `0 8px 24px -8px ${kingdom.color}60`
              }}
            >
              {/* Orbiting Dots */}
              <div className="absolute inset-0 animate-orbit">
                <div 
                  className="absolute w-2 h-2 rounded-full top-0 left-1/2 -translate-x-1/2"
                  style={{ backgroundColor: kingdom.color, opacity: 0.6 }}
                />
              </div>
              <div className="absolute inset-0 animate-orbit-reverse">
                <div 
                  className="absolute w-1.5 h-1.5 rounded-full bottom-0 left-1/2 -translate-x-1/2"
                  style={{ backgroundColor: kingdom.color, opacity: 0.4 }}
                />
              </div>
              
              <Star 
                className="w-8 h-8 fill-current"
                style={{ color: kingdom.color }}
              />
            </div>
          </div>

          {/* Text */}
          <div className="text-center space-y-1">
            <h3 className="font-bold text-white text-lg">{kingdom.name}</h3>
            <p className="text-xs text-white/70 line-clamp-2">{kingdom.description}</p>
            
            <div className="flex items-center justify-center gap-1 text-xs pt-2" style={{ color: kingdom.color }}>
              <Sparkles className="w-3 h-3" />
              <span className="font-semibold">{kingdom.jobCount || 25}개 직업</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
