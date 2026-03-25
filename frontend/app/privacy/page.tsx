import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { LegalSectionRenderer } from '@/components/legal/LegalSectionRenderer';
import privacyPolicyData from '@/data/legal/privacy-policy.json';

type PrivacyPolicyData = {
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

const typedPrivacyData = privacyPolicyData as PrivacyPolicyData;

export const metadata = {
  title: `${typedPrivacyData.metadata.title} - AI CareerPath`,
  description: 'AI CareerPath 개인정보 처리방침',
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title={typedPrivacyData.metadata.title}
      lastUpdated={typedPrivacyData.metadata.lastUpdated}
      effectiveDate={typedPrivacyData.metadata.effectiveDate}
    >
      <LegalSectionRenderer sections={typedPrivacyData.sections} />
    </LegalPageLayout>
  );
}
