"""
Views for explore app
"""

from .job_views import (
    JobCategoryViewSet,
    JobViewSet,
    JobInfographicViewSet,
)

from .high_school_views import (
    HighSchoolCategoryViewSet,
    HighSchoolViewSet,
    HighSchoolInfographicViewSet,
)

from .university_views import (
    UniversityAdmissionCategoryViewSet,
    UniversityViewSet,
    UniversityInfographicViewSet,
)

__all__ = [
    'JobCategoryViewSet',
    'JobViewSet',
    'JobInfographicViewSet',
    'HighSchoolCategoryViewSet',
    'HighSchoolViewSet',
    'HighSchoolInfographicViewSet',
    'UniversityAdmissionCategoryViewSet',
    'UniversityViewSet',
    'UniversityInfographicViewSet',
]
