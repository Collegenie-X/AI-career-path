'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { MarketingConsentSection } from '@/components/legal/MarketingConsentSection';

type ConsentState = Record<string, boolean>;

export default function MarketingConsentPage() {
  const router = useRouter();
  const [consents, setConsents] = useState<ConsentState>({});

  const handleConsentChange = (updatedConsents: ConsentState) => {
    setConsents(updatedConsents);
  };

  const handleSaveConsents = () => {
    console.log('Saving consents:', consents);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
            약관 및 마케팅 동의
          </h1>
          <p className="text-gray-400 mb-8">
            서비스 이용을 위해 필요한 약관에 동의해 주세요.
          </p>

          <MarketingConsentSection
            onConsentChange={handleConsentChange}
            initialConsents={{}}
          />

          <motion.button
            type="button"
            onClick={handleSaveConsents}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-6 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/25"
          >
            동의하고 계속하기
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
