import type { UniversityAdmissionCategory } from '../components/UniversityAdmissionList';
import studentRecordComprehensive from '@/data/university-admission/admission-categories/student-record-comprehensive.json';
import studentRecordAcademic from '@/data/university-admission/admission-categories/student-record-academic.json';
import regularAdmission from '@/data/university-admission/admission-categories/regular-admission.json';
import specialAdmission from '@/data/university-admission/admission-categories/special-admission.json';
import ruralOpportunityAdmission from '@/data/university-admission/admission-categories/rural-opportunity-admission.json';
import overseasKoreanAdmission from '@/data/university-admission/admission-categories/overseas-korean-admission.json';
import ibDirectAdmission from '@/data/university-admission/admission-categories/ib-direct-admission.json';
import international from '@/data/university-admission/admission-categories/international.json';

const categoryDataList = [
  studentRecordComprehensive,
  studentRecordAcademic,
  regularAdmission,
  specialAdmission,
  ruralOpportunityAdmission,
  overseasKoreanAdmission,
  ibDirectAdmission,
  international,
];

export function getUniversityAdmissionCategoriesSync(): UniversityAdmissionCategory[] {
  const categories: UniversityAdmissionCategory[] = [];

  for (const data of categoryDataList) {
    if (data.category) {
      categories.push({
        id: data.category.id,
        name: data.category.name,
        shortName: data.category.shortName,
        emoji: data.category.emoji,
        color: data.category.color,
        bgColor: data.category.bgColor,
        description: data.category.description,
        keyFeatures: data.category.keyFeatures || [],
        targetStudents: data.category.targetStudents || [],
        preparationGuide: data.category.preparationGuide,
        cautions: data.category.cautions,
        universities: data.category.universities,
      } as any);
    }
  }

  console.log('Loaded university admission categories:', categories.length);
  return categories;
}

