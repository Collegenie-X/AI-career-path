'use client';

import { ArrowRight } from 'lucide-react';
import type { RouteOverview } from '../../types';
import { JOB_ROUTE_LABELS } from '../../config';

type RouteOverviewCardProps = {
  overview: RouteOverview;
};

export function RouteOverviewCard({ overview }: RouteOverviewCardProps) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <h3 className="text-sm font-bold text-white mb-1">{overview.title}</h3>
      <p className="text-[11px] text-gray-400 mb-3">{overview.description}</p>

      <div className="space-y-2">
        {overview.pathways.map((pathway) => (
          <div
            key={pathway.highSchool}
            className="p-2.5 rounded-xl"
            style={{ background: `${pathway.color}10`, border: `1px solid ${pathway.color}30` }}
          >
            {/* High School */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: pathway.color, color: '#fff' }}
              >
                {pathway.highSchool}
              </span>
            </div>

            {/* Flow: University → Jobs */}
            <div className="flex items-start gap-1.5 flex-wrap">
              <div className="flex flex-wrap gap-1">
                {pathway.universities.map((uni) => (
                  <span
                    key={uni}
                    className="text-[10px] px-1.5 py-0.5 rounded text-gray-300"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    {uni}
                  </span>
                ))}
              </div>
              <ArrowRight className="w-3 h-3 text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {pathway.jobs.map((job) => (
                  <span
                    key={job}
                    className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                    style={{ background: `${pathway.color}20`, color: pathway.color }}
                  >
                    {job}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
