"""
Management command to import jobs from JSON file
"""

from django.core.management.base import BaseCommand
from apps.explore.models import Job, JobCategory
import json


class Command(BaseCommand):
    help = 'Import jobs basic information from jobs.json file'

    def add_arguments(self, parser):
        parser.add_argument(
            '--json-path',
            type=str,
            required=True,
            help='Path to jobs.json file'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing jobs before import'
        )

    def handle(self, *args, **options):
        json_path = options['json_path']
        
        if options['clear']:
            Job.objects.all().delete()
            self.stdout.write(self.style.WARNING('Cleared all existing jobs'))
        
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
        
        total_created = 0
        total_updated = 0
        
        for category_data in categories_data:
            category_id = category_data.get('id')
            
            try:
                category = JobCategory.objects.get(id=category_id)
            except JobCategory.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(f'Category {category_id} not found, skipping')
                )
                continue
            
            for job_data in category_data.get('jobs', []):
                job, created = Job.objects.update_or_create(
                    id=job_data['id'],
                    defaults={
                        'name': job_data['name'],
                        'name_en': job_data.get('name_en', ''),
                        'emoji': job_data.get('emoji', '💼'),
                        'category': category,
                        'kingdom_id': job_data.get('kingdom_id', 'explore'),
                        'rarity': job_data.get('rarity', 'common'),
                        'riasec_profile': job_data.get('riasec_profile', {}),
                        'description': job_data.get('description', ''),
                        'short_description': job_data.get('short_description', ''),
                        'company': job_data.get('company', ''),
                        'salary_range': job_data.get('salary_range', ''),
                        'difficulty': job_data.get('difficulty', 3),
                        'future_outlook': job_data.get('future_outlook', ''),
                        'outlook_score': job_data.get('outlook_score', 3),
                        'is_active': job_data.get('is_active', True),
                    }
                )
                
                if created:
                    total_created += 1
                else:
                    total_updated += 1
                
                action = 'Created' if created else 'Updated'
                self.stdout.write(
                    self.style.SUCCESS(f'{action} {job.emoji} {job.name}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\nImport completed: {total_created} created, {total_updated} updated'
            )
        )
