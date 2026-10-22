import type { HighSchoolDetail } from '../../types';

type DpScopeType = NonNullable<HighSchoolDetail['dpScope']>['type'];

const SCOPE_STYLE: Record<DpScopeType, { emoji: string; bg: string; color: string }> = {
  whole: { emoji: '🏫', bg: 'rgba(6,182,212,0.2)', color: '#22d3ee' },
  selected: { emoji: '🎯', bg: 'rgba(168,85,247,0.2)', color: '#c084fc' },
  curriculum: { emoji: '🛂', bg: 'rgba(59,130,246,0.2)', color: '#60a5fa' },
  unknown: { emoji: '❓', bg: 'rgba(255,255,255,0.08)', color: '#9ca3af' },
};

/** IB 학교인지 — 인증 완료뿐 아니라 후보학교도 포함 */
export function isIbSchool(school: HighSchoolDetail) {
  return school.ibCertified || !!school.dpScope || !!school.ibStatusLabel;
}

/**
 * IB 학교 뱃지 2개 — ① 인증 단계(월드스쿨/후보) ② DP 운영 범위(전교생/IB반 선발…)
 * 인증은 학교 단위, 이수는 학생 범위라 둘을 따로 보여 준다.
 */
export function IbStatusBadges({ school, size = 'sm' }: { school: HighSchoolDetail; size?: 'sm' | 'md' }) {
  if (!isIbSchool(school)) return null;
  const pad = size === 'md' ? 'text-xs px-1.5 py-0.5' : 'text-[11px] px-1.5 py-0.5';
  const scope = school.dpScope;
  const scopeStyle = scope ? SCOPE_STYLE[scope.type] : null;

  return (
    <>
      {school.ibCertified ? (
        <span className={`${pad} font-bold rounded-full shrink-0`} style={{ background: 'rgba(16,185,129,0.22)', color: '#10b981' }}>
          🌐 IB 월드스쿨
        </span>
      ) : (
        <span className={`${pad} font-bold rounded-full shrink-0`} style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}>
          ⏳ IB 후보
        </span>
      )}
      {scope && scopeStyle && (
        <span
          className={`${pad} font-bold rounded-full shrink-0`}
          style={{ background: scopeStyle.bg, color: scopeStyle.color }}
          title={scope.basis.replace(/==/g, '')}
        >
          {scopeStyle.emoji} {scope.label}
        </span>
      )}
    </>
  );
}
