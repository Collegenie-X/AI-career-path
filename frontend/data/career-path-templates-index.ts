/**
 * 커리어 패스 템플릿 통합 인덱스
 *
 * 고입·대입 합격 중심. 직업 기반 템플릿은 제거됨.
 * - career-path-templates-admission.json: 대입(대학-학과) 합격 커리어 패스 (수시·정시·유학)
 * - career-path-templates-highschool.json: 고입(과학고·외고·자사고) 합격 커리어 패스
 */

import admissionTemplates from './career-path-templates-admission.json';
import highschoolTemplates from './career-path-templates-highschool.json';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import aiTemplatesRaw from './career-path-templates.json';
import { normalizeCareerPathTemplates } from './career-item-structure';

export type CareerPathTemplate = (typeof admissionTemplates)[0] & {
  years: Array<
    ((typeof admissionTemplates)[0]['years'][number] & {
      items: Array<
        ((typeof admissionTemplates)[0]['years'][number]['items'][number] & {
          categoryTags?: string[];
          activitySubtype?: string;
          links?: Array<{ title: string; url: string; kind?: string }>;
        })
      >;
    })
  >;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const aiTemplates = aiTemplatesRaw as any[];

/** 고입 + 대입 + AI 커리어 패스 통합 (탐색 피드) */
export const careerPathTemplates: CareerPathTemplate[] = [
  ...highschoolTemplates,
  ...admissionTemplates,
  ...aiTemplates,
].map((template) => normalizeCareerPathTemplates([template])[0]) as CareerPathTemplate[];

export default careerPathTemplates;
