'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Shield } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import marketingConsentConfig from '@/data/legal/marketing-consent.json';

type ConsentItem = {
  readonly id: string;
  readonly type: 'essential' | 'optional';
  readonly label: string;
  readonly title: string;
  readonly description: string | null;
  readonly detailPath: string | null;
  readonly detailLabel: string | null;
  readonly required: boolean;
};

type MarketingConsentData = {
  readonly metadata: {
    readonly title: string;
    readonly description: string;
  };
  readonly consentItems: readonly ConsentItem[];
  readonly allAgreementLabel: string;
  readonly allAgreementDescription: string;
  readonly marketingConsentDetails: {
    readonly title: string;
    readonly sections: ReadonlyArray<{
      readonly id: string;
      readonly title: string;
      readonly content: readonly string[];
    }>;
  };
};

const typedMarketingConsentConfig = marketingConsentConfig as MarketingConsentData;

type ConsentState = Record<string, boolean>;

type MarketingConsentSectionProps = {
  readonly onConsentChange?: (consents: ConsentState) => void;
  readonly initialConsents?: ConsentState;
};

export function MarketingConsentSection({
  onConsentChange,
  initialConsents = {},
}: MarketingConsentSectionProps) {
  const [consents, setConsents] = useState<ConsentState>(() => {
    const initial: ConsentState = {};
    typedMarketingConsentConfig.consentItems.forEach((item) => {
      initial[item.id] = initialConsents[item.id] ?? false;
    });
    return initial;
  });

  const [showMarketingDetailDialog, setShowMarketingDetailDialog] = useState(false);

  const handleConsentToggle = (itemId: string, checked: boolean) => {
    const updatedConsents = { ...consents, [itemId]: checked };
    setConsents(updatedConsents);
    onConsentChange?.(updatedConsents);
  };

  const handleToggleAllConsents = (checked: boolean) => {
    const updatedConsents: ConsentState = {};
    typedMarketingConsentConfig.consentItems.forEach((item) => {
      updatedConsents[item.id] = checked;
    });
    setConsents(updatedConsents);
    onConsentChange?.(updatedConsents);
  };

  const isAllConsentChecked = typedMarketingConsentConfig.consentItems.every(
    (item) => consents[item.id]
  );

  const handleNavigateToDetailPage = (path: string) => {
    window.open(path, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 sm:p-8"
        style={{
          background: 'rgba(15,23,42,0.65)',
          border: '1px solid rgba(139,92,246,0.25)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-violet-500/20">
            <Shield className="h-6 w-6 text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {typedMarketingConsentConfig.metadata.title}
            </h2>
            <p className="text-sm text-gray-400">
              {typedMarketingConsentConfig.metadata.description}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <motion.div
            whileHover={{ backgroundColor: 'rgba(139,92,246,0.08)' }}
            className="flex items-center gap-3 p-4 rounded-xl border border-violet-500/20 transition-colors"
          >
            <Checkbox
              id="all-consent"
              checked={isAllConsentChecked}
              onCheckedChange={handleToggleAllConsents}
              className="h-5 w-5"
            />
            <label
              htmlFor="all-consent"
              className="flex-1 cursor-pointer select-none"
            >
              <div className="font-bold text-white">
                {typedMarketingConsentConfig.allAgreementLabel}
              </div>
              <div className="text-sm text-gray-400">
                {typedMarketingConsentConfig.allAgreementDescription}
              </div>
            </label>
          </motion.div>

          <div className="space-y-3">
            {typedMarketingConsentConfig.consentItems.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ backgroundColor: 'rgba(139,92,246,0.05)' }}
                className="flex items-center gap-3 p-4 rounded-lg transition-colors"
              >
                <Checkbox
                  id={item.id}
                  checked={consents[item.id] ?? false}
                  onCheckedChange={(checked) =>
                    handleConsentToggle(item.id, checked === true)
                  }
                  className="h-4 w-4"
                />
                <label
                  htmlFor={item.id}
                  className="flex-1 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        item.type === 'essential'
                          ? 'text-xs font-bold text-violet-400'
                          : 'text-xs font-bold text-gray-500'
                      }
                    >
                      {item.label}
                    </span>
                    <span className="text-sm font-medium text-white">
                      {item.title}
                    </span>
                  </div>
                  {item.description ? (
                    <div className="text-xs text-gray-400 mt-1">
                      {item.description}
                    </div>
                  ) : null}
                </label>
                {item.detailPath ? (
                  <button
                    type="button"
                    onClick={() => handleNavigateToDetailPage(item.detailPath!)}
                    className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    {item.detailLabel}
                    <ChevronRight className="h-3 w-3" />
                  </button>
                ) : item.id === 'optional-marketing' ? (
                  <button
                    type="button"
                    onClick={() => setShowMarketingDetailDialog(true)}
                    className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    보기
                    <ChevronRight className="h-3 w-3" />
                  </button>
                ) : null}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs text-amber-200/80 leading-relaxed flex items-start gap-2">
            <span className="text-lg shrink-0">💡</span>
            <span>
              필수항목은 서비스 이용을 위해 반드시 동의가 필요하며, 선택 항목은 동의하지 않아도 서비스 이용이 가능합니다.
            </span>
          </p>
        </div>
      </motion.div>

      <Dialog
        open={showMarketingDetailDialog}
        onOpenChange={setShowMarketingDetailDialog}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-slate-950 border-violet-500/30 text-white">
          <DialogTitle className="text-xl font-bold text-violet-300 mb-4">
            {typedMarketingConsentConfig.marketingConsentDetails.title}
          </DialogTitle>
          <div className="space-y-6">
            {typedMarketingConsentConfig.marketingConsentDetails.sections.map(
              (section) => (
                <div key={section.id}>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {section.title}
                  </h3>
                  <div className="space-y-2 text-gray-300 text-sm">
                    {section.content.map((line, lineIndex) => (
                      <p key={`${section.id}-line-${lineIndex}`}>{line}</p>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
