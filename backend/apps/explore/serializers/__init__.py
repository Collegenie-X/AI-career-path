"""
Serializers for explore app
"""

from .job_serializers import (
    JobCategorySerializer,
    JobListSerializer,
    JobDetailSerializer,
    JobCareerPathStageSerializer,
    JobInfographicSerializer,
)

from .high_school_serializers import (
    HighSchoolCategorySerializer,
    HighSchoolListSerializer,
    HighSchoolDetailSerializer,
    HighSchoolCompareSerializer,
    HighSchoolInfographicSerializer,
)

from .university_serializers import (
    UniversityAdmissionCategorySerializer,
    UniversityListSerializer,
    UniversityDetailSerializer,
    UniversityDepartmentSerializer,
    UniversityInfographicSerializer,
)

__all__ = [
    'JobCategorySerializer',
    'JobListSerializer',
    'JobDetailSerializer',
    'JobCareerPathStageSerializer',
    'JobInfographicSerializer',
    'HighSchoolCategorySerializer',
    'HighSchoolListSerializer',
    'HighSchoolDetailSerializer',
    'HighSchoolCompareSerializer',
    'HighSchoolInfographicSerializer',
    'UniversityAdmissionCategorySerializer',
    'UniversityListSerializer',
    'UniversityDetailSerializer',
    'UniversityDepartmentSerializer',
    'UniversityInfographicSerializer',
]
