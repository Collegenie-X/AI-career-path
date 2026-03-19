import { useEffect, useState } from 'react';
import { checkAndAwardBadges, type BadgeCheckResult } from '@/lib/badge-system';

/**
 * 뱃지 획득 조건을 자동으로 체크하고 새로 획득한 뱃지를 알림
 */
export function useBadgeChecker() {
  const [newBadges, setNewBadges] = useState<BadgeCheckResult[]>([]);

  useEffect(() => {
    const results = checkAndAwardBadges();
    const newlyEarned = results.filter(r => r.isNew);
    
    if (newlyEarned.length > 0) {
      setNewBadges(newlyEarned);
    }
  }, []);

  return { newBadges };
}
