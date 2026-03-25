"""
Management command to import RIASEC reports
"""

from django.core.management.base import BaseCommand
from apps.quiz.models import RiasecReport


class Command(BaseCommand):
    help = 'Import default RIASEC reports'

    def handle(self, *args, **options):
        reports_data = [
            {
                'riasec_type': 'R',
                'type_name': '실행형',
                'emoji': '🔧',
                'tagline': '손으로 만드는 실천가',
                'description': '기계나 도구를 다루며 실제적인 문제를 해결하는 것을 좋아합니다.',
                'strengths': ['실용적 사고', '손재주', '체력', '문제 해결'],
                'weaknesses': ['사교성', '언어 표현', '추상적 사고'],
                'career_keywords': ['엔지니어', '기술자', '운동선수', '요리사'],
                'recommended_activities': ['로봇 제작', '목공', '운동', '요리'],
                'famous_people': ['스티브 워즈니악', '일론 머스크'],
                'color': '#ef4444',
            },
            {
                'riasec_type': 'I',
                'type_name': '탐구형',
                'emoji': '🔬',
                'tagline': '깊이 파고드는 연구자',
                'description': '호기심이 많고 분석적이며 지적 탐구를 즐깁니다.',
                'strengths': ['분석력', '논리적 사고', '호기심', '집중력'],
                'weaknesses': ['사교성', '리더십', '실행력'],
                'career_keywords': ['연구원', '의사', '데이터 과학자', '교수'],
                'recommended_activities': ['R&E 연구', '과학실험', '독서', '코딩'],
                'famous_people': ['알버트 아인슈타인', '스티븐 호킹'],
                'color': '#6366f1',
            },
            {
                'riasec_type': 'A',
                'type_name': '예술형',
                'emoji': '🎨',
                'tagline': '창의적인 표현가',
                'description': '창의적이고 독창적인 표현을 통해 자신을 드러냅니다.',
                'strengths': ['창의력', '감수성', '표현력', '독창성'],
                'weaknesses': ['체계성', '논리성', '규칙 준수'],
                'career_keywords': ['디자이너', '작가', '음악가', '영화감독'],
                'recommended_activities': ['그림 그리기', '글쓰기', '음악', '영상 제작'],
                'famous_people': ['피카소', '스티브 잡스'],
                'color': '#ec4899',
            },
            {
                'riasec_type': 'S',
                'type_name': '사회형',
                'emoji': '🤝',
                'tagline': '사람을 돕는 조력자',
                'description': '다른 사람을 돕고 가르치며 협력하는 것을 좋아합니다.',
                'strengths': ['공감 능력', '소통', '협력', '봉사 정신'],
                'weaknesses': ['기계 다루기', '수리적 사고', '혼자 일하기'],
                'career_keywords': ['교사', '상담사', '간호사', '사회복지사'],
                'recommended_activities': ['봉사활동', '멘토링', '동아리 활동', '상담'],
                'famous_people': ['마더 테레사', '넬슨 만델라'],
                'color': '#10b981',
            },
            {
                'riasec_type': 'E',
                'type_name': '진취형',
                'emoji': '📈',
                'tagline': '목표를 이루는 리더',
                'description': '목표를 설정하고 사람들을 이끌며 성과를 내는 것을 좋아합니다.',
                'strengths': ['리더십', '설득력', '추진력', '경쟁심'],
                'weaknesses': ['세밀함', '인내심', '반복 작업'],
                'career_keywords': ['경영자', '변호사', '정치인', '영업'],
                'recommended_activities': ['학생회', '창업', '토론', '프레젠테이션'],
                'famous_people': ['일론 머스크', '잭 웰치'],
                'color': '#f59e0b',
            },
            {
                'riasec_type': 'C',
                'type_name': '관습형',
                'emoji': '📋',
                'tagline': '체계적인 관리자',
                'description': '정확하고 체계적으로 일을 처리하며 규칙을 따르는 것을 좋아합니다.',
                'strengths': ['정확성', '체계성', '책임감', '꼼꼼함'],
                'weaknesses': ['창의성', '유연성', '즉흥성'],
                'career_keywords': ['회계사', '은행원', '공무원', '사서'],
                'recommended_activities': ['회계', '데이터 정리', '문서 작성', '행정 업무'],
                'famous_people': ['워렌 버핏'],
                'color': '#8b5cf6',
            },
        ]
        
        for report_data in reports_data:
            report, created = RiasecReport.objects.update_or_create(
                riasec_type=report_data['riasec_type'],
                defaults=report_data
            )
            
            action = 'Created' if created else 'Updated'
            self.stdout.write(
                self.style.SUCCESS(
                    f'{action} {report.riasec_type}: {report.type_name}'
                )
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'\nImport completed: {len(reports_data)} RIASEC reports')
        )
