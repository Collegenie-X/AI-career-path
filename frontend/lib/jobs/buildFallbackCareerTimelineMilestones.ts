import type { Job, Milestone } from '@/app/jobs/explore/types';

const STEP_ICONS = ['📚', '⚙️', '🚀', '🎯', '⭐', '💡'];

function splitPathIntoSegments(entry: string): string[] {
  const t = entry.replace(/\r\n/g, '\n').trim();
  if (!t) return [];
  const byArrow = t
    .split(/\s*(?:→|->|⇒)\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (byArrow.length > 1) return byArrow;
  const byOr = t
    .split(/\s+OR\s+/i)
    .map((s) => s.trim())
    .filter(Boolean);
  if (byOr.length > 1) return byOr;
  return [t];
}

function splitActivities(chunk: string): string[] {
  const parts = chunk
    .split(/\+|,|·/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [chunk];
}

/**
 * JSON에 careerTimeline.milestones가 비어 있을 때,
 * entryProcess(또는 짧은 설명)를 단계로 나눠 타임라인 노드를 만듭니다.
 * (약사 등 학년별 상세 마일스톤이 이미 있으면 이 함수는 호출하지 않습니다.)
 */
export function buildFallbackCareerTimelineMilestones(job: Job): Milestone[] {
  const entry = job.entryProcess?.trim();
  if (entry) {
    const segments = splitPathIntoSegments(entry);
    return segments.map((segment, i) => ({
      period: `단계 ${i + 1}`,
      semester: '',
      icon: STEP_ICONS[i % STEP_ICONS.length],
      title: segment.length > 72 ? `${segment.slice(0, 69)}…` : segment,
      activities: splitActivities(segment),
      achievement:
        i === segments.length - 1
          ? `이후 ‘${job.name}’ 직무에서 요구되는 역량을 갖추거나, 유사 직무로 전환·심화하는 단계로 이어집니다.`
          : `다음 단계로 넘어가기 위한 학습·실무 기반을 마련합니다.`,
      cost: '개인차',
    }));
  }

  const hint = job.shortDesc?.trim() || job.description?.trim();
  if (hint) {
    return [
      {
        period: '준비',
        semester: '',
        icon: '🎯',
        title: `${job.name}로 이어지는 대표 경로`,
        activities: [hint],
        achievement:
          '전공·자격·프로젝트·인턴 등으로 역량을 쌓고, 포트폴리오와 실무 경험을 병행하는 것이 일반적입니다.',
        cost: '개인차',
      },
    ];
  }

  return [];
}
