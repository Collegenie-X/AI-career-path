import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { LegalSectionRenderer } from '@/components/legal/LegalSectionRenderer';
import emailPolicyData from '@/data/legal/email-policy.json';

type EmailPolicyData = {
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

const typedEmailPolicyData = emailPolicyData as EmailPolicyData;

export const metadata = {
  title: `${typedEmailPolicyData.metadata.title} - AI CareerPath`,
  description: 'AI CareerPath 이메일 무단수집 거부 정책',
};

export default function EmailPolicyPage() {
  return (
    <LegalPageLayout
      title={typedEmailPolicyData.metadata.title}
      lastUpdated={typedEmailPolicyData.metadata.lastUpdated}
      effectiveDate={typedEmailPolicyData.metadata.effectiveDate}
    >
      <LegalSectionRenderer sections={typedEmailPolicyData.sections} />
    </LegalPageLayout>
  );
}
