'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TabBar } from '@/components/tab-bar';
import { XPBar } from '@/components/xp-bar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { storage } from '@/lib/storage';
import projectsData from '@/data/projects.json';
import kingdomsData from '@/data/kingdoms.json';
import { 
  Rocket, Users, User, Sparkles, Target, Clock, 
  TrendingUp, Award, ChevronRight, Plus, FlaskConical,
  Code, Palette, Star
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Palette, Code, FlaskConical, Sparkles, Star
};

type ProjectType = 'all' | 'solo' | 'team';

export default function PathPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<ProjectType>('all');
  const [userXP, setUserXP] = useState(0);

  useEffect(() => {
    setMounted(true);
    const xpLog = storage.xp.get();
    setUserXP(xpLog?.totalXP || 0);
  }, []);

  if (!mounted) return null;

  const projects = projectsData as any[];
  const kingdoms = kingdomsData as any[];

  const filteredProjects = activeTab === 'all' 
    ? projects 
    : projects.filter(p => p.type === activeTab);

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case '초급': return 'text-green-400 bg-green-400/10';
      case '중급': return 'text-yellow-400 bg-yellow-400/10';
      case '고급': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden">
      {/* Space Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#1a1a2e] to-[#1a1a2e] -z-10" />
      
      {/* Floating Stars */}
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full opacity-40"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `twinkle ${3 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`
          }}
        />
      ))}

      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl border-b border-white/10" 
           style={{ backgroundColor: 'rgba(26,26,46,0.8)' }}>
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl gradient-purple flex items-center justify-center animate-pulse-glow">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold mb-1">프로젝트 창작소</h1>
              <p className="text-sm text-white/60">별에 입주하기 위한 패스를 만들어요</p>
            </div>
          </div>
          <XPBar />
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Mode Selection */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveTab('all')}
            className={`flex-1 h-11 ${activeTab === 'all' ? 'gradient-purple' : 'glass hover:bg-white/5'}`}
          >
            <Target className="w-4 h-4 mr-2" />
            전체
          </Button>
          <Button
            variant={activeTab === 'solo' ? 'default' : 'outline'}
            onClick={() => setActiveTab('solo')}
            className={`flex-1 h-11 ${activeTab === 'solo' ? 'gradient-purple' : 'glass hover:bg-white/5'}`}
          >
            <User className="w-4 h-4 mr-2" />
            나홀로
          </Button>
          <Button
            variant={activeTab === 'team' ? 'default' : 'outline'}
            onClick={() => setActiveTab('team')}
            className={`flex-1 h-11 ${activeTab === 'team' ? 'gradient-purple' : 'glass hover:bg-white/5'}`}
          >
            <Users className="w-4 h-4 mr-2" />
            팀 협업
          </Button>
        </div>

        {/* Info Card */}
        <div className="glass-card p-5 border-2 border-primary/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-start gap-3 mb-3">
              <Sparkles className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-base mb-1">프로젝트로 별에 입주하세요</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  나홀로 또는 팀을 만들어 실전 프로젝트를 완성하면 해당 별의 입주권을 받을 수 있어요
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">진행 가능한 프로젝트</h2>
            <span className="text-sm text-white/50">{filteredProjects.length}개</span>
          </div>

          {filteredProjects.map((project, idx) => {
            const star = kingdoms.find((k: any) => k.id === project.starId);
            const IconComponent = ICON_MAP[project.icon] || Target;
            const isLocked = userXP < project.requiredXP;
            const completedMilestones = project.milestones.filter((m: any) => m.status === 'complete').length;
            const totalMilestones = project.milestones.length;

            return (
              <div
                key={project.id}
                className="glass-card p-5 hover:bg-white/10 transition-all duration-300 cursor-pointer relative overflow-hidden group"
                style={{ 
                  animationDelay: `${idx * 100}ms`,
                  opacity: isLocked ? 0.6 : 1
                }}
                onClick={() => !isLocked && router.push(`/path/${project.id}`)}
              >
                {/* Hover Shimmer */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer" />
                
                {/* Lock Overlay */}
                {isLocked && (
                  <div className="absolute top-3 right-3 z-10">
                    <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      🔒
                    </div>
                  </div>
                )}

                <div className="relative">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 animate-float"
                      style={{ 
                        background: `linear-gradient(135deg, ${star?.color || '#6C5CE7'}, ${star?.bgColor || '#5B4FC9'})`,
                        boxShadow: `0 8px 24px ${star?.color || '#6C5CE7'}40`
                      }}
                    >
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          className={`text-xs ${getDifficultyColor(project.difficulty)}`}
                        >
                          {project.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {project.type === 'solo' ? '🧑 나홀로' : '👥 팀 협업'}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-base mb-1 line-clamp-1">{project.title}</h3>
                      <p className="text-sm text-white/60 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                  </div>

                  {/* Star Tag */}
                  {star && (
                    <div className="flex items-center gap-2 mb-3 text-sm">
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                        style={{ backgroundColor: `${star.color}30` }}
                      >
                        {star.icon}
                      </div>
                      <span className="text-white/70">{star.name} 별</span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-white/50" />
                      <span className="text-white/70">{project.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="w-4 h-4 text-yellow-400" />
                      <span className="text-white/70">+{project.rewardXP} XP</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {completedMilestones > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-white/50">진행률</span>
                        <span className="text-primary font-semibold">
                          {completedMilestones}/{totalMilestones}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                          style={{ width: `${(completedMilestones / totalMilestones) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Team Recruitment */}
                  {project.type === 'team' && project.lookingForRoles && (
                    <div className="mb-3 p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-xs text-white/50 mb-2">모집 중인 역할</div>
                      <div className="flex flex-wrap gap-1.5">
                        {project.lookingForRoles.map((role: string, i: number) => (
                          <span 
                            key={i} 
                            className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Required XP */}
                  {isLocked && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                      <p className="text-xs text-red-400">
                        <TrendingUp className="w-3 h-3 inline mr-1" />
                        {project.requiredXP} XP 필요 (현재 {userXP} XP)
                      </p>
                    </div>
                  )}

                  {/* Action */}
                  {!isLocked && (
                    <Button 
                      className="w-full h-11 gradient-purple hover:opacity-90 transition-opacity mt-3"
                    >
                      {project.type === 'solo' ? '시작하기' : '팀 보기'}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Custom Project CTA */}
        <div className="glass-card p-6 border-2 border-dashed border-white/20 hover:border-primary/50 transition-colors cursor-pointer group">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-bold mb-2">나만의 프로젝트 만들기</h3>
            <p className="text-sm text-white/60 mb-4">
              원하는 목표가 없다면 직접 프로젝트를 설계해보세요
            </p>
            <Button variant="outline" className="glass">
              곧 출시 예정
            </Button>
          </div>
        </div>
      </div>

      <TabBar />
    </div>
  );
}
