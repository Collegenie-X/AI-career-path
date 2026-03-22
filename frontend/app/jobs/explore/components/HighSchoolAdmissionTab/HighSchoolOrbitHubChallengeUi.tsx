'use client';

import type { ComponentProps } from 'react';
import { LibraryBig, Sparkles, Zap, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import orbitHubTabsConfig from '@/data/high-school/admission-orbit-hub-tabs.json';
import type { HighSchoolCategory } from '../../types';
import type { IdentityChallengeData, MentalChallengeData } from '../../types';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { IdentityChallengeGame } from './IdentityChallengeGame';
import { MentalChallengeGame } from './MentalChallengeGame';
import { HighSchoolResourceHubSection } from './HighSchoolResourceHubSection';
import { cn } from '@/lib/utils';

const LUCIDE_ICON_BY_KEY: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  zap: Zap,
  'library-big': LibraryBig,
};

export type HighSchoolOrbitHubChallengeTabId =
  | 'identity-challenge'
  | 'mental-challenge'
  | 'resource-hub';

type OrbitHubTabsConfig = {
  dialog: { widthPx: number; contentMaxHeightDvh: number };
  tabs: ReadonlyArray<{
    id: HighSchoolOrbitHubChallengeTabId;
    label: string;
    iconKey: string;
    ariaDialogTitle: string;
    dialogWidthPx?: number;
  }>;
};

const typedOrbitHubConfig = orbitHubTabsConfig as OrbitHubTabsConfig;

const QUIZ_FEEDBACK_SHEET_ROOT_SELECTOR = '[data-quiz-feedback-sheet]';

function isEventTargetInsideQuizFeedbackSheet(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(QUIZ_FEEDBACK_SHEET_ROOT_SELECTOR) !== null;
}

type OrbitHubChallengeDialogPointerDownOutsideEvent = NonNullable<
  ComponentProps<typeof DialogContent>['onPointerDownOutside']
> extends (event: infer E) => void
  ? E
  : never;

function preventOrbitChallengeDialogCloseOnQuizFeedbackSheetPointerDown(
  event: OrbitHubChallengeDialogPointerDownOutsideEvent
) {
  const target = event.detail.originalEvent.target;
  if (isEventTargetInsideQuizFeedbackSheet(target)) {
    event.preventDefault();
  }
}

type HighSchoolOrbitHubChallengeTabBarProps = {
  readonly onSelectTab: (tabId: HighSchoolOrbitHubChallengeTabId) => void;
};

export function HighSchoolOrbitHubChallengeTabBar({ onSelectTab }: HighSchoolOrbitHubChallengeTabBarProps) {
  return (
    <div
      className="flex rounded-xl p-1 gap-1"
      style={{
        background: 'rgba(15,23,42,0.65)',
        border: '1px solid rgba(139,92,246,0.25)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      {typedOrbitHubConfig.tabs.map(({ id, label, iconKey }) => {
        const Icon = LUCIDE_ICON_BY_KEY[iconKey] ?? Sparkles;
        return (
          <motion.button
            key={id}
            type="button"
            onClick={() => onSelectTab(id)}
            className="flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-all flex items-center justify-center gap-2 text-gray-400 hover:text-white"
            style={{ background: 'transparent' }}
            whileHover={{ scale: 1.03, backgroundColor: 'rgba(139,92,246,0.15)' }}
            whileTap={{ scale: 0.96 }}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {label}
          </motion.button>
        );
      })}
    </div>
  );
}

type HighSchoolOrbitHubChallengeDialogLayerProps = {
  readonly openTabId: HighSchoolOrbitHubChallengeTabId | null;
  readonly onRequestClose: () => void;
  readonly categories: HighSchoolCategory[];
  readonly identityData: IdentityChallengeData;
  readonly mentalData: MentalChallengeData;
  readonly onIdentitySelectCategory: (category: HighSchoolCategory) => void;
};

export function HighSchoolOrbitHubChallengeDialogLayer({
  openTabId,
  onRequestClose,
  categories,
  identityData,
  mentalData,
  onIdentitySelectCategory,
}: HighSchoolOrbitHubChallengeDialogLayerProps) {
  const activeTabMeta = openTabId
    ? typedOrbitHubConfig.tabs.find((t) => t.id === openTabId)
    : undefined;
  const maxH = typedOrbitHubConfig.dialog.contentMaxHeightDvh;
  const widthPx =
    activeTabMeta?.dialogWidthPx ?? typedOrbitHubConfig.dialog.widthPx;

  return (
    <Dialog
      open={openTabId !== null}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onRequestClose();
      }}
    >
      <DialogContent
        showCloseButton
        onPointerDownOutside={preventOrbitChallengeDialogCloseOnQuizFeedbackSheetPointerDown}
        className={cn(
          'gap-0 p-4 sm:p-5 border border-violet-500/30 bg-slate-950 text-white shadow-2xl',
          'w-full overflow-y-auto overflow-x-hidden sm:max-w-none',
        )}
        style={{
          width: `min(${widthPx}px, calc(100% - 2rem))`,
          maxWidth: widthPx,
          maxHeight: `${maxH}dvh`,
        }}
      >
        {activeTabMeta ? (
          <DialogTitle className="sr-only">{activeTabMeta.ariaDialogTitle}</DialogTitle>
        ) : null}

        <div className="min-h-0">
          {openTabId === 'identity-challenge' ? (
            <IdentityChallengeGame
              key="orbit-dialog-identity"
              data={identityData}
              categories={categories}
              onBack={onRequestClose}
              onSelectCategory={(category) => {
                onRequestClose();
                onIdentitySelectCategory(category);
              }}
            />
          ) : null}
          {openTabId === 'mental-challenge' ? (
            <MentalChallengeGame key="orbit-dialog-mental" data={mentalData} onBack={onRequestClose} />
          ) : null}
          {openTabId === 'resource-hub' ? (
            <HighSchoolResourceHubSection key="orbit-dialog-resource" onBack={onRequestClose} />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
