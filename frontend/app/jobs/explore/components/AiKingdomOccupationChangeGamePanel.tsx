'use client';

import {
  Bot,
  Cpu,
  Crosshair,
  Gem,
  Heart,
  Map,
  Package,
  ScrollText,
  Shield,
  Skull,
  Sparkles,
  Swords,
  Users,
  Zap,
} from 'lucide-react';
import {
  AI_ERA_GAME_UI_LABELS,
  KINGDOM_AI_ROLE_BULLETS,
  KINGDOM_HUMAN_ROLE_BULLETS,
} from '../config/aiEraGameUiLabels';

const KINGDOM_QUEST_ICONS = [Swords, Crosshair, Map, Sparkles, Gem, Cpu, Shield, ScrollText] as const;

export interface AiKingdomOccupationChangeGamePanelProps {
  starName: string;
  starColor: string;
  lowRiskCount: number;
  mediumRiskCount: number;
  highRiskCount: number;
  allAiTools: string[];
  allSurvivalStrategies: string[];
  footerIntroText: string;
}

function KingdomRiskStatCard({
  icon: Icon,
  value,
  title,
  subtitle,
  barColor,
  fillRatio,
  borderGlow,
}: {
  icon: React.ElementType;
  value: number;
  title: string;
  subtitle: string;
  barColor: string;
  fillRatio: number;
  borderGlow: string;
}) {
  const pct = Math.round(Math.min(1, Math.max(0, fillRatio)) * 100);
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-3 text-center"
      style={{
        background: 'linear-gradient(165deg, rgba(255,255,255,0.06), rgba(0,0,0,0.35))',
        border: `1px solid ${borderGlow}`,
        boxShadow: `0 0 24px ${borderGlow}33`,
      }}
    >
      <div className="flex flex-col items-center gap-1">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: `${barColor}22`, border: `1px solid ${barColor}44` }}
        >
          <Icon className="h-5 w-5" style={{ color: barColor }} />
        </div>
        <div className="text-2xl font-black tabular-nums text-white drop-shadow-sm">{value}</div>
        <div className="text-[10px] font-bold leading-tight text-white/90">{title}</div>
        <div className="text-[9px] text-gray-500">{subtitle}</div>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${barColor}99, ${barColor})`,
            boxShadow: `0 0 8px ${barColor}88`,
          }}
        />
      </div>
    </div>
  );
}

export function AiKingdomOccupationChangeGamePanel({
  starName,
  starColor,
  lowRiskCount,
  mediumRiskCount,
  highRiskCount,
  allAiTools,
  allSurvivalStrategies,
  footerIntroText,
}: AiKingdomOccupationChangeGamePanelProps) {
  const total = Math.max(1, lowRiskCount + mediumRiskCount + highRiskCount);
  const stableKingdom = lowRiskCount > highRiskCount;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white/80"
          style={{
            background: `${starColor}18`,
            border: `1px solid ${starColor}40`,
          }}
        >
          <Map className="h-3.5 w-3.5" style={{ color: starColor }} />
          {AI_ERA_GAME_UI_LABELS.kingdomHudBadge}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <KingdomRiskStatCard
          icon={Heart}
          value={lowRiskCount}
          title={AI_ERA_GAME_UI_LABELS.kingdomStatSafeTitle}
          subtitle={AI_ERA_GAME_UI_LABELS.kingdomStatSafeSubtitle}
          barColor="#22c55e"
          borderGlow="rgba(34, 197, 94, 0.45)"
          fillRatio={lowRiskCount / total}
        />
        <KingdomRiskStatCard
          icon={Zap}
          value={mediumRiskCount}
          title={AI_ERA_GAME_UI_LABELS.kingdomStatChangeTitle}
          subtitle={AI_ERA_GAME_UI_LABELS.kingdomStatChangeSubtitle}
          barColor="#fbbf24"
          borderGlow="rgba(251, 191, 36, 0.45)"
          fillRatio={mediumRiskCount / total}
        />
        <KingdomRiskStatCard
          icon={Skull}
          value={highRiskCount}
          title={AI_ERA_GAME_UI_LABELS.kingdomStatDangerTitle}
          subtitle={AI_ERA_GAME_UI_LABELS.kingdomStatDangerSubtitle}
          barColor="#f87171"
          borderGlow="rgba(248, 113, 113, 0.45)"
          fillRatio={highRiskCount / total}
        />
      </div>

      <div
        className="relative overflow-hidden rounded-2xl p-4"
        style={{
          background: `linear-gradient(145deg, ${starColor}14, rgba(15,15,25,0.92))`,
          border: `1.5px solid ${starColor}38`,
          boxShadow: `0 12px 40px ${starColor}15`,
        }}
      >
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-30 blur-2xl"
          style={{ background: starColor }}
        />
        <div className="relative flex items-start gap-3">
          <div
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${starColor}44, ${starColor}18)`,
              border: `1px solid ${starColor}55`,
            }}
          >
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-black tracking-tight text-white">
              {AI_ERA_GAME_UI_LABELS.kingdomRoleArenaTitle}
            </h4>
            <p className="mt-1 text-[11px] leading-relaxed text-gray-400">
              {AI_ERA_GAME_UI_LABELS.kingdomRoleArenaSubtitle}
            </p>
            <p className="mt-2 text-xs font-medium leading-relaxed text-gray-200">
              {starName} 직업군은 AI 시대에{' '}
              <span className="font-bold" style={{ color: starColor }}>
                {stableKingdom ? '상대적으로 안정적인 맵' : '큰 패치가 온 맵'}
              </span>
              입니다.
              {stableKingdom
                ? ' AI는 주로 서포트 캐릭터로 붙고, 인간이 딜·판단·관계를 담당합니다.'
                : ' 루틴은 빠르게 자동화되고, 인간은 감독·설계·고난이도 창의로 이동합니다.'}
            </p>
          </div>
        </div>

        <div className="relative mt-4 grid gap-3 sm:grid-cols-2">
          <div
            className="rounded-xl p-3"
            style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
            }}
          >
            <div className="mb-2 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-sky-300" />
              <span className="text-[11px] font-bold uppercase tracking-wide text-sky-200/90">
                {AI_ERA_GAME_UI_LABELS.kingdomAiPartyLabel}
              </span>
            </div>
            <ul className="space-y-2">
              {KINGDOM_AI_ROLE_BULLETS.map((line) => (
                <li key={line} className="flex gap-2 text-[11px] leading-relaxed text-gray-200">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-sky-400/90" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div
            className="rounded-xl p-3"
            style={{
              background: 'rgba(251, 191, 36, 0.07)',
              border: '1px solid rgba(251, 191, 36, 0.22)',
            }}
          >
            <div className="mb-2 flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-200" />
              <span className="text-[11px] font-bold uppercase tracking-wide text-amber-100/90">
                {AI_ERA_GAME_UI_LABELS.kingdomHumanPartyLabel}
              </span>
            </div>
            <ul className="space-y-2">
              {KINGDOM_HUMAN_ROLE_BULLETS.map((line) => (
                <li key={line} className="flex gap-2 text-[11px] leading-relaxed text-gray-200">
                  <Shield className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-300/90" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {allAiTools.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Package className="h-4 w-4" style={{ color: starColor }} />
            <div>
              <div className="text-xs font-bold text-white">{AI_ERA_GAME_UI_LABELS.kingdomInventoryTitle}</div>
              <div className="text-[10px] text-gray-500">{AI_ERA_GAME_UI_LABELS.kingdomInventorySubtitle}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {allAiTools.map((tool, idx) => (
              <div
                key={`${tool}-${idx}`}
                className="group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-transform hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${starColor}20, rgba(0,0,0,0.4))`,
                  border: `1px solid ${starColor}40`,
                  color: '#f3f4f6',
                  boxShadow: `0 2px 12px ${starColor}18`,
                }}
              >
                <Gem className="h-3 w-3 opacity-80" style={{ color: starColor }} />
                {tool}
              </div>
            ))}
          </div>
        </div>
      )}

      {allSurvivalStrategies.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <ScrollText className="h-4 w-4" style={{ color: starColor }} />
            <div>
              <div className="text-xs font-bold text-white">{AI_ERA_GAME_UI_LABELS.kingdomQuestBoardTitle}</div>
              <div className="text-[10px] text-gray-500">{AI_ERA_GAME_UI_LABELS.kingdomQuestBoardSubtitle}</div>
            </div>
          </div>
          <div className="space-y-2">
            {allSurvivalStrategies.map((strategy, idx) => {
              const QIcon = KINGDOM_QUEST_ICONS[idx % KINGDOM_QUEST_ICONS.length];
              return (
                <div
                  key={`${strategy.slice(0, 24)}-${idx}`}
                  className="flex items-stretch gap-2 overflow-hidden rounded-xl"
                  style={{
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.04), rgba(0,0,0,0.35))',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div
                    className="flex w-11 flex-shrink-0 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-black text-white"
                    style={{
                      background: `linear-gradient(180deg, ${starColor}55, ${starColor}22)`,
                    }}
                  >
                    <QIcon className="h-4 w-4 text-white/95" />
                    <span className="tabular-nums opacity-90">Q{idx + 1}</span>
                  </div>
                  <p className="flex flex-1 items-center py-2.5 pr-3 text-xs leading-relaxed text-gray-200">
                    {strategy}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div
        className="flex items-start gap-3 rounded-xl p-3"
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: `1px solid ${starColor}28`,
        }}
      >
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
          style={{ background: `${starColor}22` }}
        >
          <Bot className="h-4 w-4" style={{ color: starColor }} />
        </div>
        <div>
          <div className="text-[11px] font-bold text-white/90">{AI_ERA_GAME_UI_LABELS.kingdomFooterHintTitle}</div>
          <p className="mt-1 text-[11px] leading-relaxed text-gray-400">{footerIntroText}</p>
        </div>
      </div>
    </div>
  );
}
