'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { storage } from '@/lib/storage';
import {
  ArrowLeft, User, Shield, Download, Trash2, 
  Settings as SettingsIcon, LogOut, ChevronRight, Sparkles
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { UserProfile } from '@/lib/types';

export default function SettingsPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [xpLog, setXpLog] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [nickname, setNickname] = useState('');
  const [grade, setGrade] = useState('');

  useEffect(() => {
    setMounted(true);
    const user = storage.user.get();
    const xp = storage.xp.get();
    setUserData(user);
    setXpLog(xp);
    if (user) {
      setNickname(user.nickname);
      setGrade(user.grade || '');
    }
  }, []);

  const handleSaveProfile = () => {
    if (userData) {
      storage.user.set({
        ...userData,
        nickname,
        grade,
      });
      setUserData({ ...userData, nickname, grade });
      setEditDialogOpen(false);
    }
  };

  const handleExportData = () => {
    const allData = {
      user: storage.user.get(),
      xp: storage.xp.get(),
      riasec: storage.riasec.get(),
      timeline: storage.timeline.getAll(),
      simulations: storage.simulations.getAll(),
      kingdoms: storage.kingdoms.getProgress(),
      badges: storage.badges.getAll(),
      favorites: storage.favorites.getAll(),
      exportDate: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `careerpath-backup-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    storage.reset();
    router.push('/');
  };

  if (!mounted || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Space Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at top, rgba(108,92,231,0.15) 0%, transparent 50%)'
        }} />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl border-b border-white/10 px-4 py-3" style={{
        background: 'rgba(26,26,46,0.8)'
      }}>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.push('/home')}
            className="hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-wide">CONTROL PANEL</h1>
            <p className="text-xs text-muted-foreground font-mono">시스템 설정 및 관리</p>
          </div>
          <SettingsIcon className="w-5 h-5 text-primary animate-spin" style={{ animationDuration: '8s' }} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Profile Card */}
        <div className="cockpit-panel rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl relative animate-pulse"
              style={{
                background: 'linear-gradient(135deg, rgba(108,92,231,0.4), rgba(59,130,246,0.3))',
                boxShadow: '0 0 30px rgba(108,92,231,0.5)'
              }}
            >
              🚀
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-[rgb(26,26,46)] flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg">{userData.nickname}</h3>
              <p className="text-sm text-muted-foreground font-mono">
                ID: {userData.id.slice(0, 8)}
              </p>
              {userData.grade && (
                <p className="text-xs text-primary mt-1">{userData.grade}</p>
              )}
            </div>
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary/20 hover:bg-primary/30 border border-primary/40">
                  수정
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[rgb(26,26,46)] border-primary/30">
                <DialogHeader>
                  <DialogTitle>프로필 수정</DialogTitle>
                  <DialogDescription>닉네임과 학년 정보를 수정할 수 있습니다</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">닉네임</label>
                    <Input
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="닉네임 입력"
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">학년</label>
                    <Input
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      placeholder="예: 중학교 2학년"
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    취소
                  </Button>
                  <Button onClick={handleSaveProfile} className="bg-primary hover:bg-primary/90">
                    저장
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="레벨" value={xpLog ? xpLog.level : 1} color="rgba(108,92,231,0.3)" />
          <StatCard label="총 XP" value={xpLog ? xpLog.totalXP : 0} color="rgba(59,130,246,0.3)" />
          <StatCard label="활동일" value={userData.createdAt ? Math.floor((Date.now() - new Date(userData.createdAt).getTime()) / (1000 * 60 * 60 * 24)) + 1 : 1} color="rgba(34,197,94,0.3)" />
        </div>

        {/* Account Settings */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground px-2 font-mono">ACCOUNT</h3>
          <SettingItem
            icon={User}
            title="개인정보 관리"
            description="프로필, 닉네임, 학년 정보"
            onClick={() => setEditDialogOpen(true)}
          />
          <SettingItem
            icon={Shield}
            title="개인정보 처리방침"
            description="서비스 이용약관 및 정책"
            onClick={() => {}}
          />
        </div>

        {/* Data Management */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground px-2 font-mono">DATA</h3>
          <SettingItem
            icon={Download}
            title="데이터 내보내기"
            description="내 활동 기록을 JSON으로 저장"
            onClick={handleExportData}
          />
        </div>

        {/* Danger Zone */}
        <div className="space-y-2 pt-4">
          <h3 className="text-sm font-semibold text-destructive px-2 font-mono">DANGER ZONE</h3>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <div className="rounded-xl p-4 cursor-pointer border border-red-500/30 hover:border-red-500/50 transition-all" style={{
                background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.05) 100%)'
              }}>
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-400">모든 데이터 초기화</h3>
                    <p className="text-sm text-muted-foreground">모든 진행 상황이 영구 삭제됩니다</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-red-400/50" />
                </div>
              </div>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[rgb(26,26,46)] border-red-500/30">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-400">⚠️ 경고</AlertDialogTitle>
                <AlertDialogDescription>
                  정말로 모든 데이터를 삭제하시겠습니까?
                  <br /><br />
                  다음 항목이 영구적으로 삭제됩니다:
                  <br />• 프로필 정보 및 레벨
                  <br />• RIASEC 검사 결과
                  <br />• 탐험 기록 및 완료한 체험
                  <br />• 획득한 배지 및 XP
                  <br /><br />
                  <strong className="text-red-400">이 작업은 되돌릴 수 없습니다.</strong>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/10">취소</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleResetData}
                  className="bg-red-500 hover:bg-red-600"
                >
                  삭제하고 처음부터 시작
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* App Info */}
        <div className="text-center pt-8 pb-4 space-y-1 text-muted-foreground">
          <p className="text-sm font-mono">CareerPath v1.0.0</p>
          <p className="text-xs">나만의 커리어 RPG 우주선</p>
          <p className="text-xs opacity-50">Made with ❤️ by CareerPath Team</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-xl p-4 text-center border border-white/10" style={{
      background: `linear-gradient(135deg, ${color}, transparent)`
    }}>
      <div className="text-2xl font-bold font-mono">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function SettingItem({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <div
      className="rounded-xl p-4 cursor-pointer hover:bg-white/5 transition-all border border-white/10"
      onClick={onClick}
      style={{
        background: 'rgba(255,255,255,0.02)'
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </div>
  );
}
