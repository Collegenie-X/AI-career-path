'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import jobsData from '@/data/jobs.json';
import kingdomsData from '@/data/kingdoms.json';
import { Job, Kingdom } from '@/lib/types';
import { storage } from '@/lib/storage';
import {
  ArrowLeft,
  Heart,
  Play,
  Bookmark,
  TrendingUp,
  Users,
  GraduationCap,
  DollarSign,
  BookOpen,
} from 'lucide-react';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [kingdom, setKingdom] = useState<Kingdom | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const foundJob = (jobsData as Job[]).find((j) => j.id === jobId);
    setJob(foundJob || null);

    if (foundJob) {
      const k = (kingdomsData as Kingdom[]).find(
        (k) => k.id === foundJob.kingdomId
      );
      setKingdom(k || null);

      const savedJobs = storage.savedJobs.getAll();
      setIsSaved(savedJobs.includes(foundJob.id));
    }
  }, [jobId]);

  const toggleSave = () => {
    if (!job) return;

    if (isSaved) {
      storage.savedJobs.remove(job.id);
      setIsSaved(false);
    } else {
      storage.savedJobs.add(job.id);
      setIsSaved(true);
    }
  };

  const startSimulation = () => {
    if (job) {
      router.push(`/simulation/${job.id}`);
    }
  };

  if (!job) return null;

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header with Job Icon */}
      <div className="relative">
        <div
          className="h-72 flex items-center justify-center text-9xl"
          style={{
            background: `linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--primary))/60 100%)`,
          }}
        >
          {job.icon}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 text-white hover:bg-white/20"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/20"
          onClick={toggleSave}
        >
          <Bookmark
            className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`}
          />
        </Button>
      </div>

      {/* Job Title & Quick Info */}
      <div className="p-4 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">{kingdom?.name}</Badge>
            <Badge variant="outline">{job.difficulty}</Badge>
          </div>
          <h1 className="text-3xl font-bold">{job.title}</h1>
          <p className="text-muted-foreground mt-2">{job.shortDescription}</p>
        </div>

        {/* CTA Button */}
        <Button
          size="lg"
          className="w-full gradient-purple"
          onClick={startSimulation}
        >
          <Play className="w-5 h-5 mr-2" />
          하루 시뮬레이션 시작
        </Button>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={DollarSign}
            label="평균 연봉"
            value={job.avgSalary}
          />
          <StatCard
            icon={GraduationCap}
            label="학력 요구"
            value={job.educationRequired}
          />
          <StatCard
            icon={TrendingUp}
            label="성장 전망"
            value={job.growthOutlook || '보통'}
          />
          <StatCard
            icon={Users}
            label="직업 인구"
            value={job.employmentCount || '중규모'}
          />
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="l1">L1</TabsTrigger>
            <TabsTrigger value="l2">L2</TabsTrigger>
            <TabsTrigger value="l3">L3</TabsTrigger>
            <TabsTrigger value="l4">L4</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card className="glass-card p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                직업 설명
              </h3>
              <p className="text-sm text-muted-foreground">
                {job.detailedDescription}
              </p>
            </Card>

            <Card className="glass-card p-4">
              <h3 className="font-semibold mb-3">필요 역량</h3>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill, idx) => (
                  <Badge key={idx} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>

            <Card className="glass-card p-4">
              <h3 className="font-semibold mb-3">관련 자격증</h3>
              <div className="space-y-2">
                {job.certifications.map((cert, idx) => (
                  <div key={idx} className="text-sm">
                    • {cert}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="l1" className="mt-4">
            <LevelContent level={job.levels.L1} />
          </TabsContent>

          <TabsContent value="l2" className="mt-4">
            <LevelContent level={job.levels.L2} />
          </TabsContent>

          <TabsContent value="l3" className="mt-4">
            <LevelContent level={job.levels.L3} />
          </TabsContent>

          <TabsContent value="l4" className="mt-4">
            <LevelContent level={job.levels.L4} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <Card className="glass-card p-3">
      <Icon className="w-4 h-4 text-primary mb-2" />
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="font-semibold text-sm">{value}</div>
    </Card>
  );
}

function LevelContent({ level }: { level: any }) {
  return (
    <div className="space-y-4">
      <Card className="glass-card p-4">
        <h3 className="font-semibold mb-2">{level.title}</h3>
        <p className="text-sm text-muted-foreground mb-3">
          {level.description}
        </p>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">주요 업무</div>
          <div className="space-y-1">
            {level.tasks.map((task: string, idx: number) => (
              <div key={idx} className="text-sm">
                • {task}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="glass-card p-4">
        <h3 className="font-semibold mb-3">필요 역량</h3>
        <div className="flex flex-wrap gap-2">
          {level.skills.map((skill: string, idx: number) => (
            <Badge key={idx} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}
