'use client';

import { motion } from 'framer-motion';

type LegalSection = {
  readonly id: string;
  readonly title: string;
  readonly content: readonly string[];
};

type LegalSectionRendererProps = {
  readonly sections: readonly LegalSection[];
};

export function LegalSectionRenderer({ sections }: LegalSectionRendererProps) {
  return (
    <>
      {sections.map((section, sectionIndex) => (
        <motion.section
          key={section.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: sectionIndex * 0.1 }}
          className="border border-gray-800 rounded-xl p-6 sm:p-8 bg-gradient-to-br from-slate-900/50 to-slate-950/50"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-violet-300">
            {section.title}
          </h2>
          <div className="space-y-3 text-gray-300 leading-relaxed">
            {section.content.map((paragraph, paragraphIndex) => {
              if (paragraph.trim() === '') {
                return <div key={`${section.id}-p-${paragraphIndex}`} className="h-2" />;
              }

              const isListItem = /^\d+\./.test(paragraph.trim()) || paragraph.trim().startsWith('-');
              const isSubListItem = paragraph.trim().startsWith('   -');

              return (
                <p
                  key={`${section.id}-p-${paragraphIndex}`}
                  className={
                    isSubListItem
                      ? 'pl-6 text-sm text-gray-400'
                      : isListItem
                        ? 'pl-2'
                        : ''
                  }
                >
                  {paragraph}
                </p>
              );
            })}
          </div>
        </motion.section>
      ))}
    </>
  );
}
