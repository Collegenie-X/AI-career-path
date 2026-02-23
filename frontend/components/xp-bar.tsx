'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { storage } from '@/lib/storage';
import { getXPProgress } from '@/lib/xp';
import { Sparkles } from 'lucide-react';

export function XPBar() {
  const [progress, setProgress] = useState({ current: 0, max: 300, percentage: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateXP = () => {
      const xpLog = storage.xp.get();
      const p = getXPProgress(xpLog.totalXP);
      setProgress(p);
    };
    updateXP();
    const interval = setInterval(updateXP, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-semibold text-white">XP</span>
        </div>
        <span className="text-gray-400">
          {progress.current.toLocaleString()} / {progress.max.toLocaleString()}
        </span>
      </div>
      <Progress value={progress.percentage} className="h-2" />
    </div>
  );
}
