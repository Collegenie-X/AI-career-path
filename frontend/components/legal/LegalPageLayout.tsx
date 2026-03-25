'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

type LegalPageLayoutProps = {
  readonly title: string;
  readonly lastUpdated: string;
  readonly effectiveDate: string;
  readonly children: React.ReactNode;
};

export function LegalPageLayout({
  title,
  lastUpdated,
  effectiveDate,
  children,
}: LegalPageLayoutProps) {
  const router = useRouter();

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
            {title}
          </h1>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-gray-400 mb-8 sm:mb-12">
            <div>
              <span className="font-medium">최종 수정일:</span> {lastUpdated}
            </div>
            <div className="hidden sm:block text-gray-600">|</div>
            <div>
              <span className="font-medium">시행일:</span> {effectiveDate}
            </div>
          </div>

          <div className="space-y-8">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}
