import type { StrategyActionCard } from './TopStrategyHubTypes';

type TopStrategyHubCardProps = {
  card: StrategyActionCard;
  index: number;
  sectionId: string;
  gradeId: string;
};

export function TopStrategyHubCard({ card, index, sectionId, gradeId }: TopStrategyHubCardProps) {
  return (
    <div
      className="rounded-xl p-3 relative overflow-hidden group hover:scale-[1.01] transition-all"
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(30,41,59,0.8) 100%)',
        border: '2px solid rgba(99,102,241,0.3)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      }}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-400 to-purple-500" />
      <div className="flex items-start gap-2 mb-2">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500/40 to-purple-600/40 flex items-center justify-center border border-indigo-400/50 shrink-0">
          <span className="text-xs font-bold text-indigo-200">{index + 1}</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">{card.title}</p>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{card.description}</p>
        </div>
      </div>
      <div 
        className="rounded-lg p-2 mb-2"
        style={{
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(129,140,248,0.3)',
        }}
      >
        <p className="text-xs text-indigo-200 flex items-center gap-1.5">
          <span>⏰</span>
          <span className="font-semibold">권장 시점:</span>
          <span>{card.recommendedTiming}</span>
        </p>
      </div>
      <div className="space-y-1.5 pl-2">
        {card.actionSteps.map((step, stepIndex) => (
          <div
            key={`${sectionId}-${gradeId}-${index}-step-${stepIndex}`}
            className="flex items-start gap-2"
          >
            <div className="w-5 h-5 rounded-md bg-emerald-500/20 flex items-center justify-center border border-emerald-400/40 mt-0.5 shrink-0">
              <span className="text-[10px] font-bold text-emerald-300">{stepIndex + 1}</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed flex-1">
              {step}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
