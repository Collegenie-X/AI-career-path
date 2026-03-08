'use client';

import { useState } from 'react';
import { Map } from 'lucide-react';
import jobCareerRoutesData from '@/data/job-career-routes.json';
import type { JobCareerRoutesData } from '../../types';
import { JOB_ROUTE_LABELS } from '../../config';
import { JobRouteCard } from './JobRouteCard';
import { RouteOverviewCard } from './RouteOverviewCard';

const typedRoutesData = jobCareerRoutesData as JobCareerRoutesData;

export function JobCareerRouteTab() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    typedRoutesData.categories[0].id
  );
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [showOverview, setShowOverview] = useState(false);

  const selectedCategory = typedRoutesData.categories.find(
    (c) => c.id === selectedCategoryId
  );

  const handleToggleJob = (jobId: string) => {
    setExpandedJobId((prev) => (prev === jobId ? null : jobId));
  };

  return (
    <div className="space-y-4">
      {/* Intro Banner */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: 'linear-gradient(135deg, rgba(32,201,151,0.2) 0%, rgba(132,94,247,0.1) 100%)',
          border: '1px solid rgba(32,201,151,0.3)',
        }}
      >
        <div className="flex items-start gap-3">
          <div className="text-2xl">🗺️</div>
          <div>
            <h2 className="text-sm font-bold text-white">{typedRoutesData.meta.title}</h2>
            <p className="text-[11px] text-gray-300 mt-0.5">{typedRoutesData.meta.description}</p>
          </div>
        </div>
      </div>

      {/* Overview Toggle */}
      <button
        onClick={() => setShowOverview((prev) => !prev)}
        className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
        style={{
          background: showOverview ? 'rgba(132,94,247,0.2)' : 'rgba(255,255,255,0.05)',
          border: showOverview ? '1px solid rgba(132,94,247,0.4)' : '1px solid rgba(255,255,255,0.08)',
          color: showOverview ? '#c084fc' : '#9ca3af',
        }}
      >
        <Map className="w-3.5 h-3.5" />
        {showOverview ? JOB_ROUTE_LABELS.hide_overview : JOB_ROUTE_LABELS.show_overview}
      </button>

      {showOverview && (
        <RouteOverviewCard overview={typedRoutesData.routeOverview} />
      )}

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {typedRoutesData.categories.map((category) => (
          <button
            key={category.id}
            onClick={() => {
              setSelectedCategoryId(category.id);
              setExpandedJobId(null);
            }}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: selectedCategoryId === category.id
                ? `${category.color}25`
                : 'rgba(255,255,255,0.05)',
              border: selectedCategoryId === category.id
                ? `1px solid ${category.color}50`
                : '1px solid rgba(255,255,255,0.08)',
              color: selectedCategoryId === category.id ? category.color : '#9ca3af',
            }}
          >
            <span>{category.emoji}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* Job List */}
      {selectedCategory && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {selectedCategory.emoji} {selectedCategory.name} · {selectedCategory.jobs.length}{JOB_ROUTE_LABELS.job_count_suffix}
          </h3>
          {selectedCategory.jobs.map((job) => (
            <JobRouteCard
              key={job.id}
              job={job}
              categoryColor={selectedCategory.color}
              isExpanded={expandedJobId === job.id}
              onToggle={() => handleToggleJob(job.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
