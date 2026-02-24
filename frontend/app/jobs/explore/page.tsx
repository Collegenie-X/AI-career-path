'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Briefcase } from 'lucide-react';
import { TabBar } from '@/components/tab-bar';
import { StarProfilePanel, StarProfileSummary } from '@/components/star-profile-panel';
import exploreStar from '@/data/stars/explore-star.json';
import createStar from '@/data/stars/create-star.json';
import techStar from '@/data/stars/tech-star.json';
import connectStar from '@/data/stars/connect-star.json';
import natureStar from '@/data/stars/nature-star.json';
import orderStar from '@/data/stars/order-star.json';
import communicateStar from '@/data/stars/communicate-star.json';
import challengeStar from '@/data/stars/challenge-star.json';
import {
  StarField,
  StarCard,
  JobCard,
  IntroBanner,
  StarInfoBanner,
  CTABanner,
  PageHeader,
  JobDetailModal,
} from './components';
import { LABELS } from './config';
import type { StarData, Job } from './types';

export default function JobsExplorePage() {
  const router = useRouter();
  const [selectedStar, setSelectedStar] = useState<StarData | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showStarProfile, setShowStarProfile] = useState(false);

  const stars = [
    exploreStar,
    createStar,
    techStar,
    connectStar,
    natureStar,
    orderStar,
    communicateStar,
    challengeStar,
  ] as StarData[];

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ paddingBottom: 'calc(65px + env(safe-area-inset-bottom, 0px))' }}
    >
      <StarField />

      <PageHeader selectedStar={selectedStar} onBack={() => setSelectedStar(null)} />

      <div className="relative z-10 px-3 py-3 space-y-3">
        {!selectedStar ? (
          <>
            <IntroBanner />

            {/* Star Grid */}
            <div>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> {LABELS.star_grid_title}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {stars.map((s, i) => (
                  <StarCard key={s.id} star={s} index={i} onClick={() => setSelectedStar(s)} />
                ))}
                {[...Array(8 - stars.length)].map((_, i) => (
                  <div
                    key={`ph-${i}`}
                    className="rounded-3xl h-32 flex flex-col items-center justify-center gap-1"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.08)' }}
                  >
                    <div className="text-xl opacity-20">🌟</div>
                    <div className="text-[10px] text-gray-700 font-semibold">{LABELS.coming_soon}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <StarInfoBanner star={selectedStar} />

            {/* Star Profile Summary */}
            {'starProfile' in selectedStar && selectedStar.starProfile && (
              <StarProfileSummary
                star={selectedStar as Parameters<typeof StarProfileSummary>[0]['star']}
                onOpenDetail={() => setShowStarProfile(true)}
              />
            )}

            {/* Jobs */}
            <div>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> {selectedStar.jobCount}{LABELS.jobs_title}
              </h2>
              <div className="space-y-2">
                {selectedStar.jobs.map(job => (
                  <JobCard key={job.id} job={job} color={selectedStar.color} onClick={() => setSelectedJob(job)} />
                ))}
              </div>
            </div>

            <CTABanner star={selectedStar} />
          </>
        )}
      </div>

      {!selectedJob && <TabBar />}

      {/* Job Detail Modal */}
      {selectedJob && selectedStar && (
        <JobDetailModal job={selectedJob} star={selectedStar} onClose={() => setSelectedJob(null)} />
      )}

      {/* Star Profile Panel */}
      {showStarProfile && selectedStar && 'starProfile' in selectedStar && selectedStar.starProfile && (
        <StarProfilePanel
          star={selectedStar as Parameters<typeof StarProfilePanel>[0]['star']}
          onClose={() => setShowStarProfile(false)}
        />
      )}
    </div>
  );
}
