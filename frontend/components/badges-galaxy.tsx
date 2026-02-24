'use client';

import { useState, useMemo } from 'react';
import { Star, Sparkles, Lock, Zap, TrendingUp } from 'lucide-react';
import badgesData from '@/data/badges.json';
import { getBadgeProgress } from '@/lib/badge-system';
import type { Badge } from '@/lib/types';

const badges = badgesData as unknown as Badge[];

const BADGE_ICONS: Record<string, string> = {
  Sparkles: '✨',
  Heart: '❤️',
  MapPin: '📍',
  Compass: '🧭',
  Globe: '🌍',
  Play: '▶️',
  Trophy: '🏆',
  Flag: '🚩',
  Route: '🛤️',
  Users: '👥',
  Rocket: '🚀',
  Crown: '👑',
};

const RARITY_CONFIG = {
  normal: {
    gradient: 'from-slate-500 via-slate-400 to-slate-500',
    glow: 'rgba(148, 163, 184, 0.4)',
    border: 'border-slate-400/30',
    ring: 'ring-slate-400/20',
    name: '일반',
    color: '#94A3B8',
  },
  rare: {
    gradient: 'from-blue-500 via-cyan-400 to-blue-500',
    glow: 'rgba(59, 130, 246, 0.6)',
    border: 'border-blue-400/40',
    ring: 'ring-blue-400/30',
    name: '레어',
    color: '#3B82F6',
  },
  epic: {
    gradient: 'from-purple-500 via-pink-400 to-purple-500',
    glow: 'rgba(168, 85, 247, 0.7)',
    border: 'border-purple-400/50',
    ring: 'ring-purple-400/40',
    name: '에픽',
    color: '#A855F7',
  },
  legend: {
    gradient: 'from-yellow-400 via-orange-400 to-yellow-400',
    glow: 'rgba(251, 191, 36, 0.9)',
    border: 'border-yellow-400/60',
    ring: 'ring-yellow-400/50',
    name: '전설',
    color: '#FBBF24',
  },
};

interface BadgesGalaxyProps {
  earnedBadges: string[];
}

export function BadgesGalaxy({ earnedBadges }: BadgesGalaxyProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');

  const filteredBadges = useMemo(() => {
    let result = badges;
    if (filter === 'earned') {
      result = badges.filter(b => earnedBadges.includes(b.id));
    } else if (filter === 'locked') {
      result = badges.filter(b => !earnedBadges.includes(b.id));
    }
    return result.sort((a, b) => {
      const aEarned = earnedBadges.includes(a.id);
      const bEarned = earnedBadges.includes(b.id);
      if (aEarned !== bEarned) return aEarned ? -1 : 1;
      
      const rarityOrder = { legend: 0, epic: 1, rare: 2, normal: 3 };
      return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    });
  }, [filter, earnedBadges]);

  const stats = useMemo(() => {
    const byRarity = {
      normal: { earned: 0, total: 0 },
      rare: { earned: 0, total: 0 },
      epic: { earned: 0, total: 0 },
      legend: { earned: 0, total: 0 },
    };
    
    badges.forEach(badge => {
      byRarity[badge.rarity].total++;
      if (earnedBadges.includes(badge.id)) {
        byRarity[badge.rarity].earned++;
      }
    });
    
    return byRarity;
  }, [earnedBadges]);

  return (
    <div className="space-y-4">
      {/* Collection Progress Header */}
      <div className="cockpit-panel rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-xl flex items-center gap-2 mb-1">
                <Trophy className="w-5 h-5 text-yellow-400 animate-bounce" />
                배지 컬렉션
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                COSMIC ACHIEVEMENT GALLERY
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-primary">
                {earnedBadges.length}<span className="text-muted-foreground">/{badges.length}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {Math.round((earnedBadges.length / badges.length) * 100)}% 완료
              </div>
            </div>
          </div>

          {/* Rarity Stats */}
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(stats).map(([rarity, data]) => {
              const config = RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG];
              return (
                <div
                  key={rarity}
                  className="relative rounded-lg p-2 text-center border"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderColor: config.color + '30',
                  }}
                >
                  <div
                    className="text-lg font-bold"
                    style={{ color: config.color }}
                  >
                    {data.earned}/{data.total}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase">
                    {config.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1 rounded-xl bg-white/5">
        {[
          { id: 'all', label: '전체', count: badges.length },
          { id: 'earned', label: '획득', count: earnedBadges.length },
          { id: 'locked', label: '미획득', count: badges.length - earnedBadges.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`flex-1 py-2 px-3 rounded-lg font-semibold text-xs transition-all ${
              filter === tab.id
                ? 'bg-primary text-white shadow-lg'
                : 'text-muted-foreground hover:bg-white/5'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Badge Grid - Floating Constellation */}
      <div className="grid grid-cols-3 gap-3">
        {filteredBadges.map((badge, idx) => {
          const earned = earnedBadges.includes(badge.id);
          const config = RARITY_CONFIG[badge.rarity];
          const progress = getBadgeProgress(badge.id);
          
          return (
            <button
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`relative rounded-2xl p-3 text-center transition-all duration-300 ${
                earned 
                  ? `glass-card border-2 ${config.border} hover:scale-105 active:scale-95` 
                  : 'bg-white/5 opacity-50 hover:opacity-70'
              }`}
              style={{
                animation: earned ? `float ${3 + (idx % 3)}s ease-in-out infinite` : undefined,
                animationDelay: `${idx * 0.1}s`,
                boxShadow: earned ? `0 0 30px ${config.glow}` : undefined,
              }}
            >
              {/* Rarity Indicator Ring */}
              {earned && (
                <div
                  className={`absolute inset-0 rounded-2xl ring-2 ${config.ring} animate-ping`}
                  style={{ animationDuration: '3s' }}
                />
              )}
              
              {/* Lock Icon for Unearned */}
              {!earned && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/40 flex items-center justify-center">
                  <Lock className="w-3 h-3 text-gray-400" />
                </div>
              )}
              
              {/* Badge Icon */}
              <div
                className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center text-3xl relative ${
                  earned ? 'animate-pulse-glow' : 'grayscale'
                }`}
                style={{
                  background: earned 
                    ? `linear-gradient(135deg, ${config.color}40 0%, ${config.color}20 100%)`
                    : 'rgba(255,255,255,0.05)',
                  boxShadow: earned ? `0 0 20px ${config.glow}` : undefined,
                }}
              >
                {BADGE_ICONS[badge.icon] || '🏅'}
                
                {/* Orbiting particles for earned badges */}
                {earned && (
                  <>
                    <div
                      className="absolute"
                      style={{
                        top: '50%',
                        left: '50%',
                        width: 4,
                        height: 4,
                        marginTop: -2,
                        marginLeft: -2,
                        animation: `orbit ${4 + idx % 2}s linear infinite`,
                      }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                    </div>
                    <div
                      className="absolute"
                      style={{
                        top: '50%',
                        left: '50%',
                        width: 4,
                        height: 4,
                        marginTop: -2,
                        marginLeft: -2,
                        animation: `orbit ${5 + idx % 2}s linear infinite reverse`,
                      }}
                    >
                      <div
                        className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: config.color, opacity: 0.6 }}
                      />
                    </div>
                  </>
                )}
              </div>
              
              {/* Badge Name */}
              <h4 className={`font-bold text-xs mb-1 line-clamp-1 ${earned ? 'text-white' : 'text-gray-500'}`}>
                {badge.name}
              </h4>
              
              {/* Progress Bar for Locked Badges */}
              {!earned && progress.required > 1 && (
                <div className="mt-2">
                  <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {progress.current}/{progress.required}
                  </div>
                </div>
              )}
              
              {/* XP Reward */}
              {earned && (
                <div
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mt-1"
                  style={{
                    backgroundColor: `${config.color}20`,
                    color: config.color,
                  }}
                >
                  <Zap className="w-2.5 h-2.5" />
                  +{badge.xpReward}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <BadgeDetailModal
          badge={selectedBadge}
          earned={earnedBadges.includes(selectedBadge.id)}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
}

interface BadgeDetailModalProps {
  badge: Badge;
  earned: boolean;
  onClose: () => void;
}

function BadgeDetailModal({ badge, earned, onClose }: BadgeDetailModalProps) {
  const config = RARITY_CONFIG[badge.rarity];
  const progress = getBadgeProgress(badge.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
    >
      <div
        className="relative max-w-sm w-full rounded-3xl p-6 text-center"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, rgba(26,26,46,0.95) 0%, rgba(15,15,30,0.95) 100%)',
          border: `2px solid ${config.color}40`,
          boxShadow: `0 0 60px ${config.glow}, inset 0 0 40px ${config.glow}`,
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          ✕
        </button>

        {/* Animated Badge Icon */}
        <div className="relative mb-4">
          {/* Outer glow ring */}
          <div
            className={`absolute inset-0 rounded-full blur-2xl ${earned ? 'animate-pulse' : ''}`}
            style={{
              background: `radial-gradient(circle, ${config.glow} 0%, transparent 70%)`,
              transform: 'scale(1.5)',
            }}
          />
          
          {/* Badge container */}
          <div
            className={`relative w-32 h-32 mx-auto rounded-full flex items-center justify-center text-6xl ${
              earned ? 'animate-float' : 'grayscale opacity-40'
            }`}
            style={{
              background: earned
                ? `linear-gradient(135deg, ${config.color}60 0%, ${config.color}30 100%)`
                : 'rgba(255,255,255,0.05)',
              boxShadow: earned ? `0 0 40px ${config.glow}, inset 0 0 20px ${config.glow}` : undefined,
            }}
          >
            {BADGE_ICONS[badge.icon] || '🏅'}
            
            {/* Orbiting particles */}
            {earned && (
              <>
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="absolute"
                    style={{
                      top: '50%',
                      left: '50%',
                      width: 6,
                      height: 6,
                      marginTop: -3,
                      marginLeft: -3,
                      animation: `orbit ${5 + i}s linear infinite`,
                      animationDelay: `${i * 0.5}s`,
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: config.color,
                        boxShadow: `0 0 8px ${config.glow}`,
                      }}
                    />
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Rarity Badge */}
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold uppercase"
            style={{
              background: `linear-gradient(135deg, ${config.color} 0%, ${config.color}cc 100%)`,
              boxShadow: `0 0 20px ${config.glow}`,
              color: badge.rarity === 'normal' ? '#1A1A2E' : '#fff',
            }}
          >
            {config.name}
          </div>
        </div>

        {/* Badge Info */}
        <h2 className="text-2xl font-bold text-white mb-2">{badge.name}</h2>
        <p className="text-sm text-gray-400 mb-4">{badge.description}</p>

        {/* Condition */}
        <div className="glass-card p-3 mb-4">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
            <Target className="w-3.5 h-3.5" />
            <span className="uppercase font-semibold">획득 조건</span>
          </div>
          <p className="text-sm text-white font-medium">{badge.condition}</p>
          
          {/* Progress for locked badges */}
          {!earned && progress.required > 1 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">진행률</span>
                <span className="font-bold text-primary">
                  {progress.current}/{progress.required}
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500 relative"
                  style={{ width: `${progress.percentage}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rewards */}
        <div className="space-y-2">
          <div
            className="flex items-center justify-center gap-2 p-3 rounded-xl"
            style={{
              background: `linear-gradient(135deg, ${config.color}20 0%, ${config.color}10 100%)`,
              border: `1px solid ${config.color}30`,
            }}
          >
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-lg font-bold text-white">+{badge.xpReward} XP</span>
          </div>

          {badge.effect && (
            <div className="glass-card p-3">
              <div className="flex items-center justify-center gap-2 text-xs text-primary mb-1 font-semibold uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                특수 효과
              </div>
              <p className="text-sm text-white font-medium">
                {badge.effect.description}
              </p>
            </div>
          )}
        </div>

        {/* Status */}
        {earned ? (
          <div className="mt-4 flex items-center justify-center gap-2 text-green-400 font-semibold">
            <Star className="w-4 h-4 fill-current" />
            획득 완료!
          </div>
        ) : (
          <div className="mt-4 flex items-center justify-center gap-2 text-gray-500 font-semibold">
            <Lock className="w-4 h-4" />
            미획득
          </div>
        )}
      </div>
    </div>
  );
}

function Target({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
