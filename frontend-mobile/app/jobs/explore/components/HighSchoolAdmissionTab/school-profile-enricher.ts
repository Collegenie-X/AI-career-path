import selectionProfileSource from '@/data/high-school/school-selection-profiles.json';
import type { HighSchoolCategory, HighSchoolDetail, SchoolSelectionProfile } from '../../types';

type SelectionProfileSource = {
  categoryProfiles: Record<string, SchoolSelectionProfile>;
  schoolOverrides: Record<string, Partial<SchoolSelectionProfile>>;
};

const selectionProfileData = selectionProfileSource as SelectionProfileSource;

function mergeSelectionProfile(
  baseProfile: SchoolSelectionProfile | undefined,
  overrideProfile: Partial<SchoolSelectionProfile> | undefined
): SchoolSelectionProfile | undefined {
  if (!baseProfile && !overrideProfile) return undefined;
  if (!baseProfile) return overrideProfile as SchoolSelectionProfile;
  if (!overrideProfile) return baseProfile;

  return {
    ...baseProfile,
    ...overrideProfile,
    curriculumHighlights: overrideProfile.curriculumHighlights ?? baseProfile.curriculumHighlights,
    extracurricularHighlights: overrideProfile.extracurricularHighlights ?? baseProfile.extracurricularHighlights,
    clubHighlights: overrideProfile.clubHighlights ?? baseProfile.clubHighlights,
    admissionRouteStrengths: overrideProfile.admissionRouteStrengths ?? baseProfile.admissionRouteStrengths,
    majorUniversityRatios: overrideProfile.majorUniversityRatios ?? baseProfile.majorUniversityRatios,
    middleSchoolSelectionChecklist:
      overrideProfile.middleSchoolSelectionChecklist ?? baseProfile.middleSchoolSelectionChecklist,
  };
}

function enrichSchool(categoryId: string, school: HighSchoolDetail): HighSchoolDetail {
  const categoryProfile = selectionProfileData.categoryProfiles[categoryId];
  const schoolOverrideProfile = selectionProfileData.schoolOverrides[school.id];

  const mergedSelectionProfile = mergeSelectionProfile(categoryProfile, schoolOverrideProfile);

  if (!mergedSelectionProfile) return school;

  return {
    ...school,
    selectionProfile: mergedSelectionProfile,
  };
}

export function enrichHighSchoolCategories(categories: HighSchoolCategory[]): HighSchoolCategory[] {
  return categories.map((category) => ({
    ...category,
    schools: category.schools.map((school) => enrichSchool(category.id, school)),
  }));
}
