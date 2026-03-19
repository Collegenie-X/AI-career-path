'use client';

import { useState } from 'react';
import { Plus, ChevronRight, Pencil, Trash2, Check } from 'lucide-react';
import type { CareerPlan } from './CareerPathBuilder';

type Props = {
  plans: CareerPlan[];
  selectedPlanId: string | null;
  onSelectPlan: (planId: string) => void;
  onNewPlan: () => void;
  onEditPlan: (plan: CareerPlan) => void;
  onDeletePlan: (planId: string) => void;
};

export function CareerPathSelector({
  plans,
  selectedPlanId,
  onSelectPlan,
  onNewPlan,
  onEditPlan,
  onDeletePlan,
}: Props) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (planId: string) => {
    onDeletePlan(planId);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          내 커리어 패스 ({plans.length})
        </div>
        <button
          onClick={onNewPlan}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #6C5CE7, #a855f7)',
            color: '#fff',
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          새로 만들기
        </button>
      </div>

      {plans.length === 0 ? (
        <div
          className="rounded-2xl p-6 text-center"
          style={{
            border: '1.5px dashed rgba(108,92,231,0.35)',
            backgroundColor: 'rgba(108,92,231,0.05)',
          }}
        >
          <div className="text-4xl mb-3">🗺️</div>
          <div className="text-sm font-bold text-white mb-1">
            아직 커리어 패스가 없어요
          </div>
          <div className="text-xs text-gray-500">
            첫 번째 커리어 패스를 만들어보세요
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {plans.map((plan) => {
            const isSelected = plan.id === selectedPlanId;
            const isDeleting = showDeleteConfirm === plan.id;

            return (
              <div
                key={plan.id}
                className="rounded-2xl overflow-hidden transition-all"
                style={{
                  border: `1.5px solid ${isSelected ? plan.starColor : 'rgba(255,255,255,0.08)'}`,
                  background: isSelected
                    ? `linear-gradient(135deg, ${plan.starColor}18, ${plan.starColor}08)`
                    : 'rgba(255,255,255,0.03)',
                }}
              >
                <button
                  onClick={() => onSelectPlan(plan.id)}
                  className="w-full flex items-center gap-3 p-3.5 text-left transition-all"
                >
                  <div className="text-3xl flex-shrink-0">{plan.jobEmoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm leading-snug">
                      {plan.title}
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: `${plan.starColor}cc` }}
                    >
                      {plan.starEmoji} {plan.starName} · {plan.years.length}개 학년 ·{' '}
                      {plan.years.reduce((sum, y) => sum + y.items.length, 0)}개 항목
                    </div>
                  </div>
                  {isSelected && (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: plan.starColor }}
                    >
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  {!isSelected && (
                    <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  )}
                </button>

                {isSelected && !isDeleting && (
                  <div
                    className="flex gap-2 px-3.5 pb-3.5"
                    style={{ borderTop: `1px solid ${plan.starColor}20` }}
                  >
                    <button
                      onClick={() => onEditPlan(plan)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-semibold transition-all active:scale-95"
                      style={{
                        backgroundColor: `${plan.starColor}22`,
                        color: plan.starColor,
                        border: `1px solid ${plan.starColor}44`,
                      }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      수정하기
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(plan.id)}
                      className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold transition-all active:scale-95"
                      style={{
                        backgroundColor: 'rgba(239,68,68,0.15)',
                        color: '#ef4444',
                        border: '1px solid rgba(239,68,68,0.3)',
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      삭제
                    </button>
                  </div>
                )}

                {isDeleting && (
                  <div
                    className="px-3.5 pb-3.5 space-y-2"
                    style={{ borderTop: '1px solid rgba(239,68,68,0.2)' }}
                  >
                    <div className="text-xs text-center text-gray-400">
                      정말 삭제하시겠어요?
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="flex-1 h-9 rounded-xl text-xs font-semibold transition-all active:scale-95"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          color: 'rgba(255,255,255,0.6)',
                        }}
                      >
                        취소
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="flex-1 h-9 rounded-xl text-xs font-bold transition-all active:scale-95"
                        style={{
                          backgroundColor: '#ef4444',
                          color: '#fff',
                        }}
                      >
                        삭제하기
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
