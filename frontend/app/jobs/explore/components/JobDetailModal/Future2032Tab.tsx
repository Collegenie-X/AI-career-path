'use client';

import {
  Sparkles,
  Clock,
  Bot,
  User,
  Wrench,
  TrendingDown,
  ShieldCheck,
  Compass,
  Flag,
} from 'lucide-react';
import { LABELS } from '../../config';
import type { Job, StarData } from '../../types';
import { GlossaryText, GlossaryChip } from '@/components/shared/GlossaryText';

interface Future2032TabProps {
  job: Job;
  star: StarData;
}

const LEVEL_COLOR: Record<string, string> = {
  필수: '#f87171',
  권장: '#fbbf24',
  심화: '#60a5fa',
};

function SectionTitle({
  icon,
  label,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <span style={{ color }}>{icon}</span>
      <h4 className="text-sm font-extrabold" style={{ color }}>
        {label}
      </h4>
    </div>
  );
}

export function Future2032Tab({ job, star }: Future2032TabProps) {
  const f = job.future2032;

  if (!f) {
    return (
      <div className="px-4 py-12 text-center text-gray-500 text-sm">
        {LABELS.future2032_empty}
      </div>
    );
  }

  const c = star.color;

  return (
    <div className="pt-3 pb-6 px-4 space-y-5">
      {/* 헤드라인 */}
      <div
        className="rounded-2xl p-4 border"
        style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: `${c}30` }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${c}20` }}
          >
            <Sparkles className="w-5 h-5" style={{ color: c }} />
          </div>
          <div className="flex-1 min-w-0">
            <span
              className="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold mb-1"
              style={{ backgroundColor: `${c}18`, color: c }}
            >
              {LABELS.future2032_badge}
            </span>
            <h3 className="font-extrabold text-white text-base leading-snug">{f.headline}</h3>
          </div>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">
          <GlossaryText>{f.summary}</GlossaryText>
        </p>
      </div>

      {/* 역할 이동 */}
      <div>
        <SectionTitle icon={<Compass className="w-4 h-4" />} label={LABELS.future2032_shift_label} color={c} />
        <div className="grid grid-cols-2 gap-2">
          <div
            className="rounded-xl p-3"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="text-[11px] font-extrabold text-gray-500 mb-1">
              {LABELS.future2032_from_label}
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              <GlossaryText>{f.roleShift.from}</GlossaryText>
            </p>
          </div>
          <div className="rounded-xl p-3" style={{ backgroundColor: `${c}12`, border: `1px solid ${c}40` }}>
            <div className="text-[11px] font-extrabold mb-1" style={{ color: c }}>
              {LABELS.future2032_to_label}
            </div>
            <p className="text-xs text-gray-200 leading-relaxed">
              <GlossaryText>{f.roleShift.to}</GlossaryText>
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed mt-2">
          <GlossaryText>{f.roleShift.note}</GlossaryText>
        </p>
      </div>

      {/* 하루 일과 */}
      <div>
        <SectionTitle icon={<Clock className="w-4 h-4" />} label={f.dayInLife.title} color={c} />
        <div className="space-y-2">
          {f.dayInLife.slots.map((slot, i) => (
            <div
              key={`${slot.time}-${i}`}
              className="rounded-xl p-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{slot.icon}</span>
                <span
                  className="px-2 py-0.5 rounded-md text-[11px] font-extrabold"
                  style={{ backgroundColor: `${c}18`, color: c }}
                >
                  {slot.time}
                </span>
                <span className="text-sm font-bold text-white leading-snug">{slot.activity}</span>
              </div>
              <div className="space-y-1.5 pl-1">
                <div className="flex gap-2">
                  <Bot className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#60a5fa' }} />
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(147,197,253,0.9)' }}>
                    <GlossaryText>{slot.aiRole}</GlossaryText>
                  </p>
                </div>
                <div className="flex gap-2">
                  <User className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#6ee7b7' }} />
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(110,231,183,0.95)' }}>
                    <GlossaryText>{slot.humanRole}</GlossaryText>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {f.dayInLife.note && (
          <p className="text-[11px] text-gray-500 leading-relaxed mt-2">{f.dayInLife.note}</p>
        )}
      </div>

      {/* AI 시대 역량 */}
      <div>
        <SectionTitle icon={<Sparkles className="w-4 h-4" />} label={LABELS.future2032_skills_label} color={c} />
        <div className="space-y-2">
          {f.aiSkills.map((skill, i) => (
            <div
              key={`${skill.name}-${i}`}
              className="rounded-xl p-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${c}25` }}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-sm font-extrabold text-white">{skill.name}</span>
                <span className="flex gap-0.5" aria-label={`중요도 ${skill.weight}/5`}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <span
                      key={n}
                      className="w-1.5 h-3 rounded-sm"
                      style={{ backgroundColor: n <= skill.weight ? c : 'rgba(255,255,255,0.12)' }}
                    />
                  ))}
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed mb-1.5">
                <GlossaryText>{skill.why}</GlossaryText>
              </p>
              <div className="flex gap-1.5">
                <span className="text-[11px] font-extrabold flex-shrink-0" style={{ color: '#fbbf24' }}>
                  {LABELS.future2032_train_label}
                </span>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(251,191,36,0.9)' }}>
                  <GlossaryText>{skill.howToTrain}</GlossaryText>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI 도구 스택 */}
      <div>
        <SectionTitle icon={<Wrench className="w-4 h-4" />} label={LABELS.future2032_tools_label} color={c} />
        <div className="space-y-1.5">
          {f.toolStack.map((tool, i) => (
            <div
              key={`${tool.name}-${i}`}
              className="flex items-start gap-2 rounded-xl px-3 py-2"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <span
                className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold flex-shrink-0 mt-0.5"
                style={{
                  backgroundColor: `${LEVEL_COLOR[tool.level] ?? c}20`,
                  color: LEVEL_COLOR[tool.level] ?? c,
                }}
              >
                {tool.level}
              </span>
              <div className="min-w-0">
                <span className="text-xs font-extrabold text-white">
                  <GlossaryChip token={tool.name} />
                </span>
                <p className="text-xs text-gray-400 leading-relaxed">
                  <GlossaryText>{tool.role}</GlossaryText>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 사라지는 일 / 남는 일 */}
      <div className="grid grid-cols-1 gap-3">
        <div
          className="rounded-xl p-3"
          style={{ backgroundColor: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.25)' }}
        >
          <SectionTitle
            icon={<TrendingDown className="w-4 h-4" />}
            label={LABELS.future2032_fading_label}
            color="#fca5a5"
          />
          <ul className="space-y-1.5">
            {f.fading.map((item, i) => (
              <li key={`fade-${i}`} className="text-xs text-gray-300 leading-relaxed flex gap-1.5">
                <span style={{ color: '#fca5a5' }}>·</span>
                <GlossaryText>{item}</GlossaryText>
              </li>
            ))}
          </ul>
        </div>
        <div
          className="rounded-xl p-3"
          style={{ backgroundColor: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.25)' }}
        >
          <SectionTitle
            icon={<ShieldCheck className="w-4 h-4" />}
            label={LABELS.future2032_moat_label}
            color="#6ee7b7"
          />
          <ul className="space-y-1.5">
            {f.moat.map((item, i) => (
              <li key={`moat-${i}`} className="text-xs text-gray-300 leading-relaxed flex gap-1.5">
                <span style={{ color: '#6ee7b7' }}>·</span>
                <GlossaryText>{item}</GlossaryText>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 새로 생긴 역할 */}
      <div>
        <SectionTitle icon={<Flag className="w-4 h-4" />} label={LABELS.future2032_new_roles_label} color={c} />
        <div className="space-y-2">
          {f.newRoles.map((role, i) => (
            <div
              key={`${role.name}-${i}`}
              className="rounded-xl p-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${c}25` }}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-extrabold text-white">{role.name}</span>
                {role.salary && (
                  <span className="text-[11px] font-bold" style={{ color: c }}>
                    {role.salary}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                <GlossaryText>{role.what}</GlossaryText>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 지금 시작하기 */}
      <div
        className="rounded-2xl p-4 border"
        style={{ backgroundColor: `${c}0d`, borderColor: `${c}35` }}
      >
        <SectionTitle icon={<Flag className="w-4 h-4" />} label={LABELS.future2032_start_now_label} color={c} />
        <ol className="space-y-1.5">
          {f.startNow.map((item, i) => (
            <li key={`start-${i}`} className="flex gap-2">
              <span
                className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-extrabold mt-0.5"
                style={{ backgroundColor: `${c}20`, color: c }}
              >
                {i + 1}
              </span>
              <span className="text-xs text-gray-200 leading-relaxed">
                <GlossaryText>{item}</GlossaryText>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
