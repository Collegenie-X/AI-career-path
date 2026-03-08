'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Pencil } from 'lucide-react';
import {
  LABELS,
  SCHOOL_LEVELS,
  GRADE_OPTIONS,
  type SchoolLevel,
} from '../config';

export interface ProfileInputValues {
  nickname: string;
  schoolLevel: SchoolLevel | null;
  gradeId: string | null;
}

interface ProfileInputSlideProps {
  color: string;
  colorLight: string;
  onValidChange: (values: ProfileInputValues, isValid: boolean) => void;
}

function isValidNickname(value: string): boolean {
  return value.trim().length >= 2 && value.trim().length <= 10;
}

/* ─── 학교급 선택 버튼 ─── */
function SchoolLevelButton({
  id,
  labelKey,
  emoji,
  color,
  isSelected,
  onClick,
}: {
  id: SchoolLevel;
  labelKey: string;
  emoji: string;
  color: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 rounded-2xl py-3 px-2 flex flex-col items-center gap-1.5 transition-all active:scale-95 relative overflow-hidden"
      style={
        isSelected
          ? {
              background: `linear-gradient(135deg, ${color}40, ${color}20)`,
              border: `2px solid ${color}`,
              boxShadow: `0 0 16px ${color}40`,
            }
          : {
              background: 'rgba(255,255,255,0.05)',
              border: '1.5px solid rgba(255,255,255,0.12)',
            }
      }
    >
      {isSelected && (
        <div
          className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
          style={{ background: color }}
        >
          <CheckCircle2 className="w-3 h-3 text-white" />
        </div>
      )}
      <span className="text-2xl">{emoji}</span>
      <span
        className="text-xs font-black"
        style={{ color: isSelected ? color : 'rgba(255,255,255,0.6)' }}
      >
        {LABELS[labelKey]}
      </span>
    </button>
  );
}

/* ─── 학년 선택 버튼 ─── */
function GradeButton({
  labelKey,
  color,
  isSelected,
  onClick,
}: {
  labelKey: string;
  color: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl py-2.5 px-3 text-sm font-black transition-all active:scale-95"
      style={
        isSelected
          ? {
              background: `linear-gradient(135deg, ${color}, ${color}cc)`,
              color: '#fff',
              boxShadow: `0 4px 12px ${color}50`,
            }
          : {
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.1)',
            }
      }
    >
      {LABELS[labelKey]}
    </button>
  );
}

/* ─── 메인 컴포넌트 ─── */
export function ProfileInputSlide({
  color,
  colorLight,
  onValidChange,
}: ProfileInputSlideProps) {
  const [nickname, setNickname] = useState('');
  const [schoolLevel, setSchoolLevel] = useState<SchoolLevel | null>(null);
  const [gradeId, setGradeId] = useState<string | null>(null);

  const nicknameValid = isValidNickname(nickname);
  const isComplete = nicknameValid && schoolLevel !== null && gradeId !== null;

  // 학교급 바뀌면 학년 초기화
  const handleSchoolLevelSelect = (level: SchoolLevel) => {
    setSchoolLevel(level);
    setGradeId(null);
  };

  useEffect(() => {
    onValidChange({ nickname: nickname.trim(), schoolLevel, gradeId }, isComplete);
  }, [nickname, schoolLevel, gradeId, isComplete, onValidChange]);

  const selectedSchool = schoolLevel
    ? SCHOOL_LEVELS.find((s) => s.id === schoolLevel)
    : null;

  return (
    <div className="w-full space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>

      {/* 닉네임 입력 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Pencil className="w-4 h-4" style={{ color: colorLight }} />
          <label className="text-sm font-black text-white">
            {LABELS.profile_nickname_label}
          </label>
        </div>
        <div className="relative">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={LABELS.profile_nickname_placeholder}
            maxLength={10}
            className="w-full rounded-2xl px-4 py-3.5 text-sm font-bold text-white placeholder-gray-500 outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: nickname.length === 0
                ? '1.5px solid rgba(255,255,255,0.15)'
                : nicknameValid
                  ? `1.5px solid ${color}`
                  : '1.5px solid #EF4444',
              caretColor: color,
            }}
          />
          {nickname.length > 0 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span
                className="text-xs font-bold"
                style={{ color: nicknameValid ? color : '#EF4444' }}
              >
                {nickname.trim().length}/10
              </span>
              {nicknameValid && (
                <CheckCircle2 className="w-4 h-4" style={{ color }} />
              )}
            </div>
          )}
        </div>
        <p className="text-[11px] text-gray-500 mt-1.5 pl-1">
          {LABELS.profile_nickname_hint}
        </p>
      </div>

      {/* 학교급 선택 */}
      <div>
        <p className="text-sm font-black text-white mb-2.5">
          {LABELS.profile_school_label}
        </p>
        <div className="flex gap-2.5">
          {SCHOOL_LEVELS.map((school) => (
            <SchoolLevelButton
              key={school.id}
              id={school.id}
              labelKey={school.labelKey}
              emoji={school.emoji}
              color={school.color}
              isSelected={schoolLevel === school.id}
              onClick={() => handleSchoolLevelSelect(school.id)}
            />
          ))}
        </div>
      </div>

      {/* 학년 선택 (학교급 선택 후 표시) */}
      {schoolLevel && (
        <div
          className="rounded-2xl p-4"
          style={{
            background: `${selectedSchool?.color ?? color}10`,
            border: `1px solid ${selectedSchool?.color ?? color}30`,
            animation: 'fadeSlideIn 0.3s ease-out both',
          }}
        >
          <p className="text-sm font-black text-white mb-3">
            {LABELS.profile_grade_label}
          </p>
          <div className="flex gap-2 flex-wrap">
            {GRADE_OPTIONS[schoolLevel].map((grade) => (
              <GradeButton
                key={grade.id}
                labelKey={grade.labelKey}
                color={selectedSchool?.color ?? color}
                isSelected={gradeId === grade.id}
                onClick={() => setGradeId(grade.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
