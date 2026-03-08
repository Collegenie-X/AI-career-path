'use client';

import { ChevronLeft } from 'lucide-react';
import type { HighSchoolAdmissionV2Data } from '../../types';

type IdentityMentalSectionProps = {
  data: HighSchoolAdmissionV2Data['identityAndMentalStrength'];
  onBack: () => void;
};

export function IdentityMentalSection({ data, onBack }: IdentityMentalSectionProps) {
  return (
    <div className="space-y-3">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <ChevronLeft className="w-4 h-4 text-gray-300" />
        </button>
        <div>
          <h3 className="text-sm font-bold text-white">{data.title}</h3>
          <p className="text-[11px] text-gray-400">{data.description}</p>
        </div>
      </div>

      {/* 인트로 배너 */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: 'linear-gradient(135deg, rgba(132,94,247,0.2) 0%, rgba(251,191,36,0.1) 100%)',
          border: '1px solid rgba(132,94,247,0.3)',
        }}
      >
        <div className="text-center">
          <div className="text-3xl mb-2">🧘</div>
          <p className="text-sm font-bold text-white mb-1">공부 직진 속 나를 잃지 않는 법</p>
          <p className="text-[11px] text-gray-300 leading-relaxed">
            엘리트 환경에서 살아남는 것은 성적만이 아닙니다.
            <br />
            정체성과 멘탈 강도가 장기적 성공의 핵심입니다.
          </p>
        </div>
      </div>

      {/* 팁 카드들 */}
      <div className="space-y-2">
        {data.tips.map((tip, i) => (
          <div
            key={tip.title}
            className="rounded-2xl p-3.5"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{
                  background: `rgba(132,94,247,${0.1 + i * 0.05})`,
                  border: '1px solid rgba(132,94,247,0.3)',
                }}
              >
                {tip.icon}
              </div>
              <div>
                <p className="text-[13px] font-bold text-white mb-1">{tip.title}</p>
                <p className="text-[11px] text-gray-300 leading-relaxed">{tip.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 추가 메시지 */}
      <div
        className="rounded-2xl p-4"
        style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}
      >
        <p className="text-[11px] font-bold text-yellow-400 mb-2">💡 기억하세요</p>
        <div className="space-y-2">
          {[
            '성적은 수단이지 목적이 아닙니다.',
            '엘리트 환경에서의 실패는 더 큰 성장의 기회입니다.',
            '나만의 강점을 찾고 그것을 키워나가세요.',
            '공부 외에도 나를 표현할 수 있는 것을 하나 이상 가지세요.',
          ].map((msg) => (
            <div key={msg} className="flex items-start gap-2">
              <span className="text-yellow-400 mt-0.5 flex-shrink-0">•</span>
              <p className="text-[11px] text-gray-300 leading-relaxed">{msg}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
