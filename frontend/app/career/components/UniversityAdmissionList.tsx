'use client';

import { useState } from 'react';
import { ChevronRight, GraduationCap } from 'lucide-react';

export interface UniversityAdmissionCategory {
  id: string;
  name: string;
  shortName?: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
  keyFeatures: string[];
  targetStudents: string[];
}

interface UniversityAdmissionListProps {
  categories: UniversityAdmissionCategory[];
  selectedCategoryId: string | null;
  onSelectCategory: (category: UniversityAdmissionCategory) => void;
}

export function UniversityAdmissionList({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: UniversityAdmissionListProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-white">대입 전형 유형</h2>
      </div>

      <div className="space-y-2">
        {categories.map((category, index) => {
          const isSelected = selectedCategoryId === category.id;
          const isHovered = hoveredId === category.id;

          return (
            <div
              key={category.id}
              className="relative cursor-pointer group"
              style={{
                animation: `slide-up 0.4s ease-out ${index * 0.05}s both`,
              }}
              onClick={() => onSelectCategory(category)}
              onMouseEnter={() => setHoveredId(category.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div
                className="relative rounded-xl overflow-hidden backdrop-blur-xl border transition-all duration-300"
                style={{
                  borderColor: isSelected
                    ? category.color
                    : 'rgba(255,255,255,0.1)',
                  backgroundColor: isSelected
                    ? category.bgColor
                    : 'rgba(255,255,255,0.03)',
                  transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: isHovered
                    ? `0 8px 24px -6px ${category.color}40`
                    : 'none',
                }}
              >
                {isHovered && (
                  <div
                    className="absolute inset-0 pointer-events-none animate-shimmer"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
                      backgroundSize: '200% 100%',
                    }}
                  />
                )}

                <div className="relative p-4 flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-all duration-300"
                    style={{
                      backgroundColor: `${category.color}20`,
                      boxShadow: isHovered
                        ? `0 4px 16px -4px ${category.color}60`
                        : 'none',
                    }}
                  >
                    <span>{category.emoji}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white">
                        {category.name}
                      </h3>
                      {category.shortName && (
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${category.color}30`,
                            color: category.color,
                          }}
                        >
                          {category.shortName}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {category.description}
                    </p>
                  </div>

                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:translate-x-1"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    <ChevronRight
                      className="w-4 h-4"
                      style={{ color: category.color }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 rounded-xl border border-white/10 bg-white/5">
        <p className="text-xs text-muted-foreground">
          💡 각 전형을 클릭하면 상세 준비 가이드, 학군별 전략, 타임라인 등을
          확인할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
