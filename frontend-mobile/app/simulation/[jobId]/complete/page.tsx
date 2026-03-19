'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import jobsData from '@/data/jobs.json';
import type { Job } from '@/lib/types';
import { storage } from '@/lib/storage';
import { getLevelForXP } from '@/lib/xp';
import { Trophy, Star, TrendingUp, Home } from 'lucide-react';

export default function SimulationCompletePage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [earnedXP, setEarnedXP] = useState(0);
  const [leveledUp, setLeveledUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);

  useEffect(() => {
    const foundJob = (jobsData as unknown as Job[]).find((j) => j.id === jobId);
    setJob(foundJob || null);

    const xpLog = storage.xp.get();
    if (xpLog) {
      const levelInfo = getLevelForXP(xpLog.totalXP);
      setNewLevel(levelInfo.level);
      // Simplified XP calculation
      setEarnedXP(50);
    }
  }, [jobId]);

  if (!job) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full gradient-purple flex items-center justify-center shadow-2xl shadow-primary/30">
            <Trophy className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold mb-2">시뮬레이션 완료!</h1>
          <p className="text-muted-foreground">
            {job.title} 직업 체험을 완료했습니다
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="glass-card p-4">
            <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{earnedXP}</div>
            <div className="text-xs text-muted-foreground">획득 XP</div>
          </Card>
          <Card className="glass-card p-4">
            <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">Lv.{newLevel}</div>
            <div className="text-xs text-muted-foreground">현재 레벨</div>
          </Card>
        </div>

        {leveledUp && (
          <Card className="glass-card p-4 bg-primary/10 border-primary">
            <div className="flex items-center gap-3 justify-center">
              <Star className="w-5 h-5 text-primary" />
              <span className="font-semibold">레벨업!</span>
            </div>
          </Card>
        )}

        {/* Unlocked Skills */}
        <Card className="glass-card p-4">
          <h3 className="font-semibold mb-3">획득한 역량</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {job.requiredSkills.slice(0, 3).map((skill, idx) => (
              <Badge key={idx} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <Button
            size="lg"
            className="w-full gradient-purple"
            onClick={() => router.push(`/jobs/${jobId}`)}
          >
            직업 상세 보기
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            onClick={() => router.push('/home')}
          >
            <Home className="w-5 h-5 mr-2" />
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}
