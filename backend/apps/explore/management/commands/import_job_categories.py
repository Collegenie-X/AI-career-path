"""
Management command to import job categories from JSON file
"""

from django.core.management.base import BaseCommand
from apps.explore.models import JobCategory
import json


class Command(BaseCommand):
    help = 'Import job categories from kingdoms.json file'

    def add_arguments(self, parser):
        parser.add_argument(
            '--json-path',
            type=str,
            required=True,
            help='Path to kingdoms.json file'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing categories before import'
        )

    def handle(self, *args, **options):
        json_path = options['json_path']
        
        if options['clear']:
            JobCategory.objects.all().delete()
            self.stdout.write(self.style.WARNING('Cleared all existing job categories'))
        
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'File not found: {json_path}'))
            return
        except json.JSONDecodeError as e:
            self.stdout.write(self.style.ERROR(f'Invalid JSON: {e}'))
            return
        
        kingdoms_data = data.get('kingdoms', [])
        
        for idx, kingdom_data in enumerate(kingdoms_data):
            category, created = JobCategory.objects.update_or_create(
                id=kingdom_data['id'],
                defaults={
                    'name': kingdom_data['name'],
                    'emoji': kingdom_data.get('emoji', '🌟'),
                    'color': kingdom_data.get('color', '#6366f1'),
                    'description': kingdom_data.get('description', ''),
                    'order_index': idx,
                }
            )
            
            action = 'Created' if created else 'Updated'
            self.stdout.write(
                self.style.SUCCESS(f'{action} {category.emoji} {category.name}')
            )
        
        total = JobCategory.objects.count()
        self.stdout.write(
            self.style.SUCCESS(f'\nImport completed: {total} job categories')
        )
