"""
Explore app models - 25 models for job, high school, and university exploration
"""

from .job_models import (
    JobCategory,
    Job,
    JobCareerPathStage,
    JobCareerPathTask,
    JobKeyPreparation,
    JobRecommendedHighSchool,
    JobRecommendedUniversity,
    JobDailySchedule,
    JobRequiredSkill,
    JobMilestone,
    JobAcceptee,
)

from .high_school_models import (
    HighSchoolCategory,
    HighSchool,
    HighSchoolAdmissionStep,
    HighSchoolCareerPathDetail,
    HighSchoolHighlightStat,
    HighSchoolRealTalk,
    HighSchoolDailySchedule,
    HighSchoolFamousProgram,
)

from .university_models import (
    UniversityAdmissionCategory,
    University,
    UniversityDepartment,
    UniversityAdmissionPlaybook,
)

from .infographic_models import (
    JobInfographic,
    HighSchoolInfographic,
    UniversityInfographic,
)

__all__ = [
    'JobCategory',
    'Job',
    'JobCareerPathStage',
    'JobCareerPathTask',
    'JobKeyPreparation',
    'JobRecommendedHighSchool',
    'JobRecommendedUniversity',
    'JobDailySchedule',
    'JobRequiredSkill',
    'JobMilestone',
    'JobAcceptee',
    'HighSchoolCategory',
    'HighSchool',
    'HighSchoolAdmissionStep',
    'HighSchoolCareerPathDetail',
    'HighSchoolHighlightStat',
    'HighSchoolRealTalk',
    'HighSchoolDailySchedule',
    'HighSchoolFamousProgram',
    'UniversityAdmissionCategory',
    'University',
    'UniversityDepartment',
    'UniversityAdmissionPlaybook',
    'JobInfographic',
    'HighSchoolInfographic',
    'UniversityInfographic',
]
