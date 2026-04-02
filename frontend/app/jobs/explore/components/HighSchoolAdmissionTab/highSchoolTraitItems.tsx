'use client';

import type { ReactNode } from 'react';
import {
  BookOpen,
  Brain,
  Clock,
  Dumbbell,
  Star,
  Target,
} from 'lucide-react';
/** `categoryTraits`에서 다이얼로그·목록에 노출하는 6개 축 (identity는 별도 섹션에서 다룰 수 있음) */
export type HighSchoolTraitAxisKey =
  | 'aptitude'
  | 'studyStyle'
  | 'mentalStrength'
  | 'gradeRequirement'
  | 'aptitudeTest'
  | 'internalGradeStrategy';

export const TRAIT_ITEMS: {
  key: HighSchoolTraitAxisKey;
  icon: ReactNode;
  label: string;
  emoji: string;
}[] = [
  { key: 'aptitude', icon: <Brain className="w-3.5 h-3.5" />, label: '🧠 적성', emoji: '🧠' },
  { key: 'studyStyle', icon: <BookOpen className="w-3.5 h-3.5" />, label: '📖 공부 스타일', emoji: '📖' },
  { key: 'mentalStrength', icon: <Dumbbell className="w-3.5 h-3.5" />, label: '💪 멘탈 강도', emoji: '💪' },
  { key: 'gradeRequirement', icon: <Star className="w-3.5 h-3.5" />, label: '📊 내신 기준', emoji: '📊' },
  { key: 'aptitudeTest', icon: <Target className="w-3.5 h-3.5" />, label: '🎯 적성 검사', emoji: '🎯' },
  { key: 'internalGradeStrategy', icon: <Clock className="w-3.5 h-3.5" />, label: '📅 내신 전략', emoji: '📅' },
];
