import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { LegalSectionRenderer } from '@/components/legal/LegalSectionRenderer';
import termsOfServiceData from '@/data/legal/terms-of-service.json';

type TermsOfServiceData = {
  readonly metadata: {
    readonly title: string;
    readonly lastUpdated: string;
    readonly effectiveDate: string;
  };
  readonly sections: ReadonlyArray<{
    readonly id: string;
    readonly title: string;
    readonly content: readonly string[];
  }>;
};

const typedTermsData = termsOfServiceData as TermsOfServiceData;

export const metadata = {
  title: `${typedTermsData.metadata.title} - AI CareerPath`,
  description: 'AI CareerPath 서비스 이용약관',
};

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      title={typedTermsData.metadata.title}
      lastUpdated={typedTermsData.metadata.lastUpdated}
      effectiveDate={typedTermsData.metadata.effectiveDate}
    >
      <LegalSectionRenderer sections={typedTermsData.sections} />
    </LegalPageLayout>
  );
}
