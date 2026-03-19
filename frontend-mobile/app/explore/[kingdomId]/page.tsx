'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import kingdomsData from '@/data/kingdoms.json';
import jobsData from '@/data/jobs.json';
import { Kingdom, Job } from '@/lib/types';
import { getJobDetailNav } from '@/app/jobs/explore/utils/resolveStarJob';
import { ArrowLeft, Sparkles, Star, Zap, TrendingUp, Lock } from 'lucide-react';
import { storage } from '@/lib/storage';

export default function KingdomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const kingdomId = params.kingdomId as string;

  const [kingdom, setKingdom] = useState<Kingdom | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const k = (kingdomsData as Kingdom[]).find((k) => k.id === kingdomId);
    setKingdom(k || null);

    const filteredJobs = (jobsData as Job[]).filter(
      (j) => j.kingdomId === kingdomId
    );
    setJobs(filteredJobs);
  }, [kingdomId]);

  if (!mounted || !kingdom) return null;

  return (
    <div className="min-h-screen relative overflow-hidden pb-6">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{ 
            background: `radial-gradient(ellipse at 50% 30%, ${kingdom.color}20 0%, transparent 70%)`
          }}
        />
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              backgroundColor: kingdom.color,
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `particle-rise ${Math.random() * 8 + 6}s ease-in infinite`,
              animationDelay: `${Math.random() * 4}s`,
              opacity: 0.3
            }}
          />
        ))}
      </div>

      {/* Hero Header */}
      <div className="relative z-10">
        <div 
          className="relative h-64 flex flex-col overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${kingdom.bgColor}ee 0%, ${kingdom.bgColor}cc 100%)`
          }}
        >
          {/* Top Nav */}
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 backdrop-blur-sm rounded-full"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md">
              {kingdom.riasecTypes?.map((type, i) => (
                <span 
                  key={i}
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ 
                    backgroundColor: `${kingdom.color}40`,
                    color: 'white'
                  }}
                >
                  {type}
                </span>
              ))}
            </div>
          </div>

          {/* Star Icon & Title */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6">
            <div 
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4 animate-float relative"
              style={{ 
                backgroundColor: `${kingdom.color}35`,
                boxShadow: `0 12px 32px -8px ${kingdom.color}90`
              }}
            >
              {/* Pulse Ring */}
              <div 
                className="absolute inset-0 rounded-3xl animate-pulse-glow"
                style={{ 
                  border: `2px solid ${kingdom.color}60`
                }}
              />
              
              <Star 
                className="w-10 h-10 fill-current"
                style={{ color: kingdom.color }}
              />
            </div>

            <h1 className="text-3xl font-bold text-white mb-2 text-center">
              {kingdom.name}
            </h1>
            <p className="text-white/80 text-sm text-center max-w-xs text-balance">
              {kingdom.description}
            </p>
          </div>

          {/* Decorative Bottom Wave */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-background" style={{
            clipPath: 'ellipse(60% 100% at 50% 100%)'
          }} />
        </div>
      </div>

      {/* Jobs List */}
      <div className="relative z-10 px-4 -mt-4 space-y-4">
        {/* Stats Bar */}
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl glass-card">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color: kingdom.color }} />
            <span className="font-semibold">직업 목록</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span className="font-bold" style={{ color: kingdom.color }}>{jobs.length}</span>
            <span>개</span>
          </div>
        </div>

        {/* Jobs Grid */}
        {jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map((job, index) => (
              <JobCard 
                key={job.id}
                job={job}
                kingdom={kingdom}
                index={index}
                onClick={() => {
                  const nav = getJobDetailNav(job.id, job.kingdomId);
                  router.push(nav.url);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div 
              className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${kingdom.color}15` }}
            >
              <Lock className="w-10 h-10" style={{ color: kingdom.color, opacity: 0.5 }} />
            </div>
            <h3 className="font-semibold text-lg mb-2">준비 중이에요</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto text-balance">
              {kingdom.name}의 직업들이 곧 추가됩니다.<br />
              조금만 기다려 주세요!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function JobCard({ 
  job, 
  kingdom, 
  index,
  onClick 
}: { 
  job: Job; 
  kingdom: Kingdom;
  index: number;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const simLogs = storage.simulations.getAll();
  const isExplored = simLogs.some(log => log.jobId === job.id);

  return (
    <div
      className="relative cursor-pointer group"
      style={{
        animation: `slide-up 0.5s ease-out ${index * 0.08}s both`
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="relative rounded-2xl overflow-hidden backdrop-blur-xl border border-white/10 transition-all duration-300"
        style={{
          backgroundColor: 'rgba(255,255,255,0.03)',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          boxShadow: isHovered ? `0 8px 24px -6px ${kingdom.color}40` : 'none'
        }}
      >
        {/* Shine on Hover */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none animate-shimmer" />
        )}

        <div className="relative p-4 flex items-center gap-4">
          {/* Job Icon */}
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 relative"
            style={{ 
              backgroundColor: `${kingdom.color}20`,
              boxShadow: isHovered ? `0 4px 16px -4px ${kingdom.color}60` : 'none',
              transition: 'all 0.3s'
            }}
          >
            {isExplored && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            )}
            <span>{job.icon || '💼'}</span>
          </div>

          {/* Job Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white mb-1">{job.name || job.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {job.shortDescription || job.description}
            </p>
            
            <div className="flex items-center gap-3 text-xs">
              {job.difficulty && (
                <span 
                  className="px-2 py-0.5 rounded-full font-semibold"
                  style={{ 
                    backgroundColor: `${kingdom.color}20`,
                    color: kingdom.color
                  }}
                >
                  {job.difficulty}
                </span>
              )}
              {job.avgSalary && (
                <span className="text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {job.avgSalary}
                </span>
              )}
              {job.rarity && (
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span style={{ color: kingdom.color }}>{job.rarity}</span>
                </span>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:translate-x-1"
            style={{ backgroundColor: `${kingdom.color}15` }}
          >
            <ArrowLeft 
              className="w-4 h-4 rotate-180"
              style={{ color: kingdom.color }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
