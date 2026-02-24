'use client';

import { useEffect, useState } from 'react';
import { Trophy, Sparkles, X } from 'lucide-react';
import badgesData from '@/data/badges.json';
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

const RARITY_COLORS = {
  normal: '#94A3B8',
  rare: '#3B82F6',
  epic: '#A855F7',
  legend: '#FBBF24',
};

interface BadgeToastProps {
  badgeId: string;
  onClose: () => void;
}

export function BadgeToast({ badgeId, onClose }: BadgeToastProps) {
  const [visible, setVisible] = useState(false);
  const badge = badges.find(b => b.id === badgeId);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!badge) return null;

  const rarityColor = RARITY_COLORS[badge.rarity];

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full mx-4 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div
        className="relative rounded-2xl p-4 backdrop-blur-xl border-2 overflow-hidden"
        style={{
          backgroundColor: 'rgba(26,26,46,0.95)',
          borderColor: `${rarityColor}60`,
          boxShadow: `0 0 40px ${rarityColor}40, inset 0 0 20px ${rarityColor}20`,
        }}
      >
        {/* Animated background glow */}
        <div
          className="absolute inset-0 opacity-20 animate-pulse"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${rarityColor} 0%, transparent 70%)`,
          }}
        />

        {/* Close button */}
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
        >
          <X className="w-3 h-3" />
        </button>

        <div className="relative flex items-center gap-4">
          {/* Badge icon with animation */}
          <div className="relative flex-shrink-0">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl animate-scale-bounce"
              style={{
                background: `linear-gradient(135deg, ${rarityColor}60 0%, ${rarityColor}30 100%)`,
                boxShadow: `0 0 30px ${rarityColor}60`,
              }}
            >
              {BADGE_ICONS[badge.icon] || '🏅'}
            </div>
            
            {/* Orbiting particle */}
            <div
              className="absolute"
              style={{
                top: '50%',
                left: '50%',
                width: 4,
                height: 4,
                marginTop: -2,
                marginLeft: -2,
                animation: 'orbit 3s linear infinite',
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: rarityColor,
                  boxShadow: `0 0 6px ${rarityColor}`,
                }}
              />
            </div>
          </div>

          {/* Badge info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-bold text-yellow-400 uppercase">
                배지 획득!
              </span>
            </div>
            <h3 className="text-base font-bold text-white mb-1 truncate">
              {badge.name}
            </h3>
            <p className="text-xs text-gray-400 line-clamp-2 mb-2">
              {badge.description}
            </p>
            <div className="flex items-center gap-2">
              <div
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: `${rarityColor}30`,
                  color: rarityColor,
                }}
              >
                <Sparkles className="w-3 h-3" />
                +{badge.xpReward} XP
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface BadgeToastManagerProps {
  badgeIds: string[];
}

export function BadgeToastManager({ badgeIds }: BadgeToastManagerProps) {
  const [queue, setQueue] = useState<string[]>([]);
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    if (badgeIds.length > 0) {
      setQueue(badgeIds);
    }
  }, [badgeIds]);

  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue(prev => prev.slice(1));
    }
  }, [current, queue]);

  if (!current) return null;

  return (
    <BadgeToast
      badgeId={current}
      onClose={() => setCurrent(null)}
    />
  );
}
