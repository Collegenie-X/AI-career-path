"""
Management command to import job detailed data (arrays) from JSON file
"""

from django.core.management.base import BaseCommand
from apps.explore.models import (
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
import json


class Command(BaseCommand):
    help = 'Import job detailed data (career path, preparations, etc.) from JSON file'

    def add_arguments(self, parser):
        parser.add_argument(
            '--json-path',
            type=str,
            required=True,
            help='Path to job-career-routes.json file'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing related data before import'
        )

    def handle(self, *args, **options):
        json_path = options['json_path']
        
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'File not found: {json_path}'))
            return
        except json.JSONDecodeError as e:
            self.stdout.write(self.style.ERROR(f'Invalid JSON: {e}'))
            return
        
        categories_data = data.get('categories', [])
        
        for category_data in categories_data:
            for job_data in category_data.get('jobs', []):
                job_id = job_data.get('id')
                
                try:
                    job = Job.objects.get(id=job_id)
                except Job.DoesNotExist:
                    self.stdout.write(
                        self.style.WARNING(f'Job {job_id} not found, skipping')
                    )
                    continue
                
                if options['clear']:
                    job.career_path_stages.all().delete()
                    job.key_preparations.all().delete()
                    job.recommended_high_schools_rel.all().delete()
                    job.recommended_universities_rel.all().delete()
                    job.daily_schedules.all().delete()
                    job.required_skills.all().delete()
                    job.milestones.all().delete()
                    job.acceptees.all().delete()
                
                for idx, stage_data in enumerate(job_data.get('careerPath', [])):
                    stage = JobCareerPathStage.objects.create(
                        job=job,
                        stage=stage_data['stage'],
                        period=stage_data.get('period', ''),
                        icon=stage_data.get('icon', '📍'),
                        order_index=idx
                    )
                    
                    for task_idx, task in enumerate(stage_data.get('tasks', [])):
                        JobCareerPathTask.objects.create(
                            stage=stage,
                            task_description=task,
                            order_index=task_idx
                        )
                
                for idx, prep in enumerate(job_data.get('keyPreparation', [])):
                    JobKeyPreparation.objects.create(
                        job=job,
                        preparation_item=prep,
                        order_index=idx
                    )
                
                for idx, hs in enumerate(job_data.get('recommendedHighSchool', [])):
                    JobRecommendedHighSchool.objects.create(
                        job=job,
                        high_school_type=hs,
                        high_school_name=hs,
                        order_index=idx
                    )
                
                for idx, univ_data in enumerate(job_data.get('recommendedUniversities', [])):
                    if isinstance(univ_data, str):
                        univ_name = univ_data
                        admission_type = ''
                        difficulty = 3
                    else:
                        univ_name = univ_data.get('name', '')
                        admission_type = univ_data.get('admission_type', '')
                        difficulty = univ_data.get('difficulty', 3)
                    
                    JobRecommendedUniversity.objects.create(
                        job=job,
                        university_name=univ_name,
                        admission_type=admission_type,
                        difficulty=difficulty,
                        order_index=idx
                    )
                
                l2_data = job_data.get('l2', {})
                for idx, schedule_data in enumerate(l2_data.get('dailySchedule', [])):
                    JobDailySchedule.objects.create(
                        job=job,
                        time=schedule_data.get('time', ''),
                        activity=schedule_data.get('activity', ''),
                        emoji=schedule_data.get('emoji', '📌'),
                        order_index=idx
                    )
                
                l3_data = job_data.get('l3', {})
                for idx, skill_data in enumerate(l3_data.get('requiredSkills', [])):
                    JobRequiredSkill.objects.create(
                        job=job,
                        skill_name=skill_data.get('name', ''),
                        score=skill_data.get('score', 3),
                        order_index=idx
                    )
                
                l4_data = job_data.get('l4', {})
                for idx, milestone_data in enumerate(l4_data.get('milestones', [])):
                    JobMilestone.objects.create(
                        job=job,
                        stage=milestone_data.get('stage', ''),
                        title=milestone_data.get('title', ''),
                        description=milestone_data.get('description', ''),
                        icon=milestone_data.get('icon', '🎯'),
                        order_index=idx
                    )
                
                l5_data = job_data.get('l5', {})
                for idx, acceptee_data in enumerate(l5_data.get('acceptees', [])):
                    JobAcceptee.objects.create(
                        job=job,
                        acceptee_type=acceptee_data.get('type', ''),
                        name=acceptee_data.get('name', ''),
                        school=acceptee_data.get('school', ''),
                        gpa=acceptee_data.get('gpa', ''),
                        activities=acceptee_data.get('activities', []),
                        order_index=idx
                    )
                
                self.stdout.write(
                    self.style.SUCCESS(f'✓ {job.name} - detailed data imported')
                )
        
        self.stdout.write(
            self.style.SUCCESS('\nJob details import completed')
        )
