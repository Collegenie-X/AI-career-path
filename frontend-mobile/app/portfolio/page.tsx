'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TabBar } from '@/components/tab-bar';
import { BadgesGalaxy } from '@/components/badges-galaxy';
import { storage } from '@/lib/storage';
import { getLevelForXP } from '@/lib/xp';
import kingdomsData from '@/data/kingdoms.json';
import jobsData from '@/data/jobs.json';
import projectsData from '@/data/projects.json';
import { 
  Award, Star, Sparkles, Trophy, MapPin, Clock, 
  TrendingUp, Target, Zap, Settings, ChevronRight,
  Microscope, Palette, Cpu, Leaf, Users, Scale, Megaphone, Rocket
} from 'lucide-react';
import { Line, LineChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const iconMap: Record<string, React.ElementType> = {
  Microscope, Palette, Cpu, Leaf, Users, Scale, Megaphone, Rocket
};
import type { Kingdom, Job, TimelineEvent, SimulationLog, XPLog } from '@/lib/types';

const kingdoms = kingdomsData as unknown as Kingdom[];
const jobs = jobsData as unknown as Job[];

export default function PortfolioPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'journey' | 'badges' | 'stats'>('journey');
  
  const [xpLog, setXpLog] = useState<XPLog | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [simulations, setSimulations] = useState<SimulationLog[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [visitedKingdoms, setVisitedKingdoms] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const xp = storage.xp.get();
    const tlEvents = storage.timeline.getAll();
    const sims = storage.simulations.getAll();
    const earnedBadgeIds = storage.badges.getAll();
    const progress = storage.kingdoms.getProgress();
    const user = storage.user.get();
    
    setXpLog(xp);
    setTimeline(tlEvents);
    setSimulations(sims);
    setEarnedBadges(earnedBadgeIds);
    setUserProfile(user);
    // Extract kingdom IDs where entered is true
    const visited = Object.entries(progress)
      .filter(([_, data]) => data.entered)
      .map(([kingdomId]) => kingdomId);
    setVisitedKingdoms(visited);
  }, []);

  if (!mounted || !xpLog) return null;

  const levelInfo = getLevelForXP(xpLog.totalXP);

  // Prepare chart data
  const xpChartData = xpLog.history.slice(-10).map((record, idx) => ({
    date: new Date(record.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    xp: record.xp
  }));

  const categoryData = [
    { name: '탐험', count: visitedKingdoms.length, fill: 'hsl(var(--stage1))' },
    { name: '체험', count: simulations.length, fill: 'hsl(var(--stage2))' },
    { name: '배지', count: earnedBadges.length, fill: 'hsl(var(--stage3))' },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Space Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at top, rgba(108,92,231,0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(59,130,246,0.1) 0%, transparent 50%)'
        }} />
        <StarField count={30} />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl border-b border-white/10" style={{ backgroundColor: 'rgba(26,26,46,0.8)' }}>
        <div className="w-full px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary animate-pulse-glow" />
              드림 북
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">나의 우주 항해 일지</p>
          </div>
          <button
            onClick={() => router.push('/settings')}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Astronaut Profile Card */}
        <div className="px-4 pb-4">
          <div className="glass-card p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <div className="relative flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl animate-float" style={{
                  background: 'linear-gradient(135deg, rgb(108,92,231) 0%, rgb(59,130,246) 100%)',
                  boxShadow: '0 0 30px rgba(108,92,231,0.4)'
                }}>
                  🚀
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold border-2 border-background">
                  {levelInfo.level}
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold">{userProfile?.nickname || '탐험가'}</h2>
                <p className="text-sm text-muted-foreground">{levelInfo.name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500"
                      style={{ width: `${(xpLog.totalXP / levelInfo.maxXP) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-primary">{xpLog.totalXP}/{levelInfo.maxXP}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 p-1 rounded-xl bg-white/5">
            {[
              { id: 'journey', label: '여정', icon: MapPin },
              { id: 'badges', label: '배지', icon: Award },
              { id: 'stats', label: '통계', icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-muted-foreground hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 pb-32 space-y-4">
        {activeTab === 'journey' && (
          <>
            {/* My Projects Section */}
            <div className="cockpit-panel rounded-2xl p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-primary" />
                  <span className="tracking-wide">MY PROJECTS</span>
                </h3>
                <button
                  onClick={() => router.push('/path')}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  전체보기
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-4 font-mono">
                진행 중인 미션 및 완료 프로젝트
              </p>
              <div className="space-y-3">
                {(projectsData as any[]).slice(0, 3).map((project, idx) => (
                  <div
                    key={project.id}
                    className="relative rounded-xl p-4 border border-white/10 hover:border-primary/30 transition-all cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, rgba(108,92,231,0.05) 0%, rgba(59,130,246,0.02) 100%)',
                      animation: `slide-up 0.4s ease-out ${idx * 0.1}s both`
                    }}
                    onClick={() => router.push('/path')}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 text-2xl">
                        {project.icon === 'Palette' ? '🎨' :
                         project.icon === 'Code' ? '💻' :
                         project.icon === 'Flask' ? '🧪' :
                         project.icon === 'Users' ? '👥' :
                         project.icon === 'Gamepad2' ? '🎮' :
                         project.icon === 'Video' ? '🎬' :
                         project.icon === 'BarChart' ? '📊' : '🎵'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-bold text-sm line-clamp-1">{project.title}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                            project.type === 'solo' 
                              ? 'bg-blue-500/20 text-blue-300' 
                              : 'bg-green-500/20 text-green-300'
                          }`}>
                            {project.type === 'solo' ? '나홀로' : '팀'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {project.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">{project.duration}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-primary font-semibold">+{project.rewardXP} XP</span>
                        </div>
                      </div>
                    </div>
                    {project.type === 'team' && project.lookingForRoles && (
                      <div className="mt-3 pt-3 border-t border-white/10 flex gap-2 flex-wrap">
                        {project.lookingForRoles.map((role: string) => (
                          <span key={role} className="text-xs px-2 py-1 rounded bg-white/5 text-muted-foreground">
                            {role}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Journey Map - Spaceship Control Panel */}
            <div className="relative rounded-2xl overflow-hidden border border-primary/30" style={{
              background: 'linear-gradient(135deg, rgba(108,92,231,0.1) 0%, rgba(59,130,246,0.05) 100%)',
              boxShadow: '0 0 40px rgba(108,92,231,0.2), inset 0 0 60px rgba(108,92,231,0.05)'
            }}>
              {/* Corner Decorations */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary/40 rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-primary/40 rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-primary/40 rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-primary/40 rounded-br-2xl" />
              
              {/* Animated Scan Line */}
              <div className="absolute inset-0 pointer-events-none">
                <div 
                  className="h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"
                  style={{
                    animation: 'scan-line 3s linear infinite'
                  }}
                />
              </div>
              
              <div className="relative p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="tracking-wide">NAVIGATION MAP</span>
                  </h3>
                  <div className="px-2 py-1 rounded bg-primary/20 text-primary text-xs font-mono font-bold">
                    {visitedKingdoms.length}/8
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-4 font-mono">
                  {visitedKingdoms.length}개의 별 방문 완료
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {kingdoms.map((kingdom) => {
                    const visited = visitedKingdoms.includes(kingdom.id);
                    const IconComponent = iconMap[kingdom.icon] || Sparkles;
                    return (
                      <div
                        key={kingdom.id}
                        className={`relative rounded-xl p-3 transition-all border ${
                          visited 
                            ? 'glass-card border-primary/30 shadow-lg' 
                            : 'bg-white/5 border-white/10 opacity-50'
                        }`}
                        style={visited ? {
                          boxShadow: `0 0 20px ${kingdom.color}40`
                        } : undefined}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              visited ? 'animate-pulse' : ''
                            }`}
                            style={visited ? {
                              background: `linear-gradient(135deg, ${kingdom.color}40 0%, ${kingdom.color}20 100%)`
                            } : { backgroundColor: 'rgba(255,255,255,0.05)' }}
                          >
                            <IconComponent 
                              className="w-5 h-5" 
                              style={visited ? { color: kingdom.color } : undefined}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold line-clamp-1">
                              {kingdom.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {kingdom.jobCount}개 직업
                            </div>
                          </div>
                          {visited && (
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                              <Star className="w-3 h-3 text-white fill-current" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="glass-card p-5">
              <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                항해 일지
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                최근 {timeline.length}개 활동 기록
              </p>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {timeline.length > 0 ? (
                  timeline.slice(0, 10).map((event, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                      style={{
                        animation: `slide-up 0.4s ease-out ${idx * 0.05}s both`
                      }}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{event.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.date).toLocaleDateString('ko-KR', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {event.xp > 0 && (
                            <span className="text-xs font-semibold text-primary">+{event.xp} XP</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">아직 활동 기록이 없습니다</p>
                  </div>
                )}
              </div>
            </div>

            {/* Completed Simulations */}
            <div className="glass-card p-5">
              <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                완료한 직업 체험
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {simulations.length > 0 ? `${simulations.length}개 직업 시뮬레이션 완료` : '아직 완료한 체험이 없습니다'}
              </p>
              {simulations.length > 0 ? (
                <div className="space-y-2">
                  {simulations.slice(0, 5).map((sim, idx) => {
                    const job = jobs.find(j => j.id === sim.jobId);
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => router.push(`/jobs/${sim.jobId}`)}
                      >
                        <div className="text-3xl">{job?.icon || '💼'}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{job?.name || '직업'}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(sim.completedAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                        <div className="text-xs font-semibold text-primary">+{sim.earnedXP} XP</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">직업 체험을 시작해보세요!</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'badges' && (
          <BadgesGalaxy earnedBadges={earnedBadges} />
        )}

        {activeTab === 'stats' && (
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard 
                icon={Star} 
                label="총 경험치" 
                value={xpLog.totalXP.toLocaleString()} 
                color="text-yellow-400"
              />
              <StatCard 
                icon={Trophy} 
                label="레벨" 
                value={levelInfo.level} 
                color="text-purple-400"
              />
              <StatCard 
                icon={MapPin} 
                label="방문한 별" 
                value={visitedKingdoms.length} 
                color="text-blue-400"
              />
              <StatCard 
                icon={Target} 
                label="완료 체험" 
                value={simulations.length} 
                color="text-green-400"
              />
            </div>

            {/* XP Trend Chart */}
            <div className="cockpit-panel rounded-2xl p-5">
              <h3 className="font-bold text-base mb-1 flex items-center gap-2 tracking-wide">
                <TrendingUp className="w-4 h-4 text-primary" />
                XP GROWTH CHART
              </h3>
              <p className="text-xs text-muted-foreground mb-4 font-mono">
                최근 10개 활동 경험치 추이
              </p>
              {xpChartData.length > 0 ? (
                <ChartContainer
                  config={{
                    xp: {
                      label: 'XP',
                      color: 'hsl(var(--primary))',
                    },
                  }}
                  className="h-48 w-full"
                >
                  <LineChart data={xpChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(108,92,231,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                      stroke="rgba(108,92,231,0.3)"
                    />
                    <YAxis 
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                      stroke="rgba(108,92,231,0.3)"
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="xp" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    />
                  </LineChart>
                </ChartContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  활동 기록이 없습니다
                </div>
              )}
            </div>

            {/* Activity Distribution */}
            <div className="cockpit-panel rounded-2xl p-5">
              <h3 className="font-bold text-base mb-1 flex items-center gap-2 tracking-wide">
                <Target className="w-4 h-4 text-primary" />
                ACTIVITY STATS
              </h3>
              <p className="text-xs text-muted-foreground mb-4 font-mono">
                활동 분포 현황
              </p>
              <ChartContainer
                config={{
                  count: {
                    label: '개수',
                    color: 'hsl(var(--primary))',
                  },
                }}
                className="h-48 w-full"
              >
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(108,92,231,0.1)" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                    stroke="rgba(108,92,231,0.3)"
                  />
                  <YAxis 
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                    stroke="rgba(108,92,231,0.3)"
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>

            {/* XP History Log */}
            <div className="glass-card p-5">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                XP 히스토리
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {xpLog.history.slice().reverse().slice(0, 20).map((record, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{record.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(record.date).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <div className="text-sm font-bold text-primary">+{record.xp}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <TabBar />
    </div>
  );
}

function StarField({ count }: { count: number }) {
  return (
    <div className="absolute inset-0">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.5 + 0.3,
            animation: `twinkle ${2 + Math.random() * 3}s ease-in-out ${Math.random() * 2}s infinite`
          }}
        />
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { 
  icon: React.ElementType; 
  label: string; 
  value: string | number;
  color: string;
}) {
  return (
    <div className="glass-card p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-xl" />
      <div className="relative">
        <Icon className={`w-8 h-8 ${color} mb-2`} />
        <div className="text-2xl font-bold mb-1">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
