import type { StatItem } from '../config';

interface StatsGridProps {
  items: StatItem[];
  show: boolean;
}

export function StatsGrid({ items, show }: StatsGridProps) {
  return (
    <div
      className="grid grid-cols-2 gap-3 mb-5"
      style={{ 
        opacity: show ? 1 : 0, 
        transform: show ? 'translateY(0)' : 'translateY(20px)', 
        transition: 'all 0.6s ease-out 0.15s' 
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="relative p-4 rounded-2xl overflow-hidden text-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="absolute inset-0 animate-shimmer" />
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2.5"
            style={{ backgroundColor: `${item.color}18` }}
          >
            <item.icon className="w-5 h-5" style={{ color: item.color }} />
          </div>
          <div className="font-bold text-lg" style={{ color: item.color }}>{item.label}</div>
          <div className="text-[11px] text-white/40 mt-0.5">{item.desc}</div>
        </div>
      ))}
    </div>
  );
}
