'use client';

import { Star } from 'lucide-react';

/**
 * 즐겨찾기 별 토글. 학교 카드(<button>)·프로그램 카드(<a>) 안에 들어가므로
 * 진짜 <button> 대신 role="button" span 으로 두고 클릭이 카드로 번지지 않게 막는다.
 */
export function FavoriteStar({
  active,
  onToggle,
  color = '#FACC15',
  size = 'md',
  label,
  variant = 'icon',
}: {
  /** 'pill': 학교 상세 헤더처럼 글자까지 보여 주는 눈에 띄는 버튼 */
  readonly variant?: 'icon' | 'pill';
  readonly active: boolean;
  readonly onToggle: () => void;
  readonly color?: string;
  readonly size?: 'sm' | 'md';
  readonly label: string;
}) {
  if (variant === 'pill') return <FavoritePill active={active} onToggle={onToggle} color={color} label={label} />;
  const box = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
  const icon = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const fire = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle();
  };
  return (
    <span
      role="button"
      tabIndex={0}
      aria-pressed={active}
      aria-label={active ? `${label} 즐겨찾기 해제` : `${label} 즐겨찾기 추가`}
      title={active ? '즐겨찾기 해제' : '즐겨찾기에 추가'}
      onClick={fire}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') fire(e);
      }}
      className={`${box} rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer transition-all hover:scale-110 active:scale-90`}
      style={{
        background: active ? `${color}33` : 'rgba(255,255,255,0.06)',
        border: `1px solid ${active ? `${color}aa` : 'rgba(255,255,255,0.16)'}`,
        boxShadow: active ? `0 0 10px ${color}55` : 'none',
      }}
    >
      <Star
        className={icon}
        style={{ color: active ? color : 'rgba(255,255,255,0.55)', fill: active ? color : 'transparent' }}
      />
    </span>
  );
}

/** 글자 달린 즐겨찾기 버튼 — 상세 헤더용. 독립 버튼이라 진짜 <button> 을 쓴다 */
function FavoritePill({
  active,
  onToggle,
  color,
  label,
}: {
  readonly active: boolean;
  readonly onToggle: () => void;
  readonly color: string;
  readonly label: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      aria-label={active ? `${label} 즐겨찾기 해제` : `${label} 즐겨찾기 추가`}
      title={active ? '즐겨찾기 해제' : '즐겨찾기에 추가'}
      className="h-8 inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 text-[12px] font-black whitespace-nowrap transition-all hover:scale-105 active:scale-95"
      style={{
        background: active ? `linear-gradient(135deg, ${color}55, rgba(251,146,60,0.4))` : `${color}1a`,
        border: `1px solid ${active ? color : `${color}66`}`,
        color: active ? '#FEF9C3' : color,
        boxShadow: active ? `0 0 14px ${color}66` : 'none',
      }}
    >
      <Star className="w-3.5 h-3.5" style={{ color, fill: active ? color : 'transparent' }} />
      <span className="hidden sm:inline">{active ? '즐겨찾기됨' : '즐겨찾기'}</span>
    </button>
  );
}
