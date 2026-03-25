'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Shield, MailX, ChevronRight, type LucideIcon } from 'lucide-react';
import legalOverviewData from '@/data/legal/legal-overview.json';

const LUCIDE_ICON_BY_KEY: Record<string, LucideIcon> = {
  'file-text': FileText,
  shield: Shield,
  'mail-x': MailX,
};

type LegalDocument = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly path: string;
  readonly iconKey: string;
  readonly required: boolean;
};

type LegalOverviewData = {
  readonly metadata: {
    readonly title: string;
    readonly description: string;
  };
  readonly legalDocuments: readonly LegalDocument[];
};

const typedLegalOverviewData = legalOverviewData as LegalOverviewData;

export default function LegalOverviewPage() {
  const router = useRouter();

  const handleNavigateToDocument = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 sm:mb-8"
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">뒤로가기</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            {typedLegalOverviewData.metadata.title}
          </h1>
          <p className="text-gray-400 mb-8 sm:mb-12">
            {typedLegalOverviewData.metadata.description}
          </p>

          <div className="grid gap-4 sm:gap-6">
            {typedLegalOverviewData.legalDocuments.map((document, documentIndex) => {
              const Icon = LUCIDE_ICON_BY_KEY[document.iconKey] ?? FileText;
              return (
                <motion.button
                  key={document.id}
                  type="button"
                  onClick={() => handleNavigateToDocument(document.path)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: documentIndex * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative overflow-hidden rounded-2xl p-6 sm:p-8 text-left transition-all"
                  style={{
                    background: 'rgba(15,23,42,0.65)',
                    border: '1px solid rgba(139,92,246,0.25)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                  }}
                >
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-violet-500/20 group-hover:bg-violet-500/30 transition-colors">
                      <Icon className="h-6 w-6 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-xl font-bold text-white">
                          {document.title}
                        </h2>
                        {document.required ? (
                          <span className="text-xs font-bold text-violet-400 px-2 py-0.5 rounded bg-violet-500/20">
                            필수
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {document.description}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-violet-400 transition-colors shrink-0 mt-1" />
                  </div>

                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{
                      background:
                        'radial-gradient(circle at center, rgba(139,92,246,0.1) 0%, transparent 70%)',
                    }}
                  />
                </motion.button>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 sm:mt-12 p-6 rounded-xl border border-gray-800 bg-slate-900/30"
          >
            <h3 className="text-lg font-bold text-white mb-3">문의하기</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              약관 및 정책과 관련하여 문의사항이 있으시면 아래 연락처로 문의해 주세요.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">이메일:</span>
                <a
                  href="mailto:support@aicareerpath.com"
                  className="text-violet-400 hover:text-violet-300 transition-colors"
                >
                  support@aicareerpath.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">운영:</span>
                <span className="text-gray-300">10000 Labs</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
