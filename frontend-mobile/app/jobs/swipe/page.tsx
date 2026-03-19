'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import jobsData from '@/data/jobs.json';
import kingdomsData from '@/data/kingdoms.json';
import { Job, Kingdom } from '@/lib/types';
import { storage } from '@/lib/storage';
import { getJobDetailNav } from '@/app/jobs/explore/utils/resolveStarJob';
import { ArrowLeft, Heart, X, Info } from 'lucide-react';

export default function JobSwipePage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    // Get recommended jobs based on user's RIASEC
    const userData = storage.user.get();
    if (!userData?.riasecScores) {
      router.push('/quiz');
      return;
    }

    setJobs(jobsData as Job[]);
  }, [router]);

  const currentJob = jobs[currentIndex];

  const handleSwipe = (liked: boolean) => {
    if (!currentJob) return;

    setDirection(liked ? 'right' : 'left');

    setTimeout(() => {
      if (liked) {
        storage.savedJobs.add(currentJob.id);
      }

      if (currentIndex < jobs.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setDirection(null);
      } else {
        router.push('/home');
      }
    }, 300);
  };

  const handleInfo = () => {
    if (currentJob) {
      const nav = getJobDetailNav(currentJob.id, currentJob.kingdomId);
      router.push(nav.url);
    }
  };

  const getKingdom = (kingdomId: string): Kingdom | undefined => {
    return (kingdomsData as Kingdom[]).find((k) => k.id === kingdomId);
  };

  if (!currentJob) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">모든 직업을 확인했어요!</h2>
          <Button onClick={() => router.push('/home')}>홈으로 돌아가기</Button>
        </div>
      </div>
    );
  }

  const kingdom = getKingdom(currentJob.kingdomId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} / {jobs.length}
        </span>
        <Button variant="ghost" size="icon" onClick={handleInfo}>
          <Info className="w-5 h-5" />
        </Button>
      </div>

      {/* Card Stack */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="relative w-full max-w-sm">
          <Card
            className={`glass-card overflow-hidden transition-all duration-300 ${
              direction === 'left'
                ? '-translate-x-[200%] rotate-[-20deg] opacity-0'
                : direction === 'right'
                ? 'translate-x-[200%] rotate-[20deg] opacity-0'
                : 'translate-x-0 rotate-0 opacity-100'
            }`}
          >
            {/* Job Image/Icon */}
            <div
              className="h-64 flex items-center justify-center text-8xl"
              style={{
                background: `linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--primary))/60 100%)`,
              }}
            >
              {currentJob.icon}
            </div>

            {/* Job Info */}
            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{kingdom?.name}</Badge>
                  <Badge variant="outline">{currentJob.difficulty}</Badge>
                </div>
                <h2 className="text-2xl font-bold">{currentJob.title}</h2>
              </div>

              <p className="text-muted-foreground">{currentJob.shortDescription}</p>

              <div className="space-y-2 pt-2">
                <InfoRow label="평균 연봉" value={currentJob.avgSalary} />
                <InfoRow label="학력 요구" value={currentJob.educationRequired} />
                <InfoRow
                  label="성장 전망"
                  value={currentJob.growthOutlook || '보통'}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-xl border-t border-border p-6">
        <div className="flex items-center justify-center gap-6 max-w-sm mx-auto">
          <Button
            size="lg"
            variant="outline"
            className="w-16 h-16 rounded-full border-2"
            onClick={() => handleSwipe(false)}
          >
            <X className="w-8 h-8" />
          </Button>
          <Button
            size="lg"
            className="w-16 h-16 rounded-full gradient-purple"
            onClick={() => handleSwipe(true)}
          >
            <Heart className="w-8 h-8" />
          </Button>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-4">
          관심 있으면 ❤️, 아니면 ✕
        </p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
