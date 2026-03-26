"""
Management command to import quiz questions from JSON file
"""

from django.core.management.base import BaseCommand
from apps.quiz.models import QuizQuestion, QuizChoice
import json


class Command(BaseCommand):
    help = 'Import quiz questions and choices from JSON file'

    def add_arguments(self, parser):
        parser.add_argument(
            '--json-path',
            type=str,
            required=True,
            help='Path to quiz questions JSON file'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing questions before import'
        )

    def handle(self, *args, **options):
        json_path = options['json_path']
        
        if options['clear']:
            QuizQuestion.objects.all().delete()
            self.stdout.write(self.style.WARNING('Cleared all existing quiz questions'))
        
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'File not found: {json_path}'))
            return
        except json.JSONDecodeError as e:
            self.stdout.write(self.style.ERROR(f'Invalid JSON: {e}'))
            return

        # { "questions": [...] } 또는 프론트 export 형식(최상위 배열) 모두 지원
        if isinstance(data, list):
            questions_data = data
        elif isinstance(data, dict):
            questions_data = data.get('questions', [])
        else:
            self.stdout.write(self.style.ERROR('JSON must be a list or an object with key "questions"'))
            return

        for question_data in questions_data:
            order_index = question_data.get('order_index')
            if order_index is None:
                order_index = question_data.get('id')
            if order_index is None:
                self.stdout.write(self.style.WARNING(f'Skip question without order_index/id: {question_data!r}'))
                continue

            zone_icon = question_data.get('zone_icon') or question_data.get('zoneIcon') or '🎯'
            feedback_map = question_data.get('feedback_map') or question_data.get('feedbackMap') or {}

            question, created = QuizQuestion.objects.update_or_create(
                order_index=order_index,
                defaults={
                    'zone': question_data.get('zone', ''),
                    'zone_icon': zone_icon,
                    'situation': question_data.get('situation', ''),
                    'description': question_data.get('description', ''),
                    'feedback_map': feedback_map,
                    'is_active': question_data.get('is_active', True),
                }
            )

            QuizChoice.objects.filter(question=question).delete()

            for idx, choice_data in enumerate(question_data.get('choices', [])):
                choice_key = choice_data.get('choice_key') or choice_data.get('id')
                if not choice_key:
                    self.stdout.write(self.style.WARNING(f'Skip choice without choice_key/id on Q{order_index}'))
                    continue
                riasec_scores = choice_data.get('riasec_scores') or choice_data.get('riasecScores') or {}
                order_i = choice_data.get('order_index', idx)
                QuizChoice.objects.create(
                    question=question,
                    choice_key=str(choice_key),
                    text=choice_data.get('text', ''),
                    riasec_scores=riasec_scores,
                    order_index=order_i,
                )
            
            action = 'Created' if created else 'Updated'
            self.stdout.write(
                self.style.SUCCESS(
                    f'{action} Q{question.order_index}: {question.situation}'
                )
            )
        
        total_questions = QuizQuestion.objects.count()
        total_choices = QuizChoice.objects.count()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\nImport completed: {total_questions} questions, {total_choices} choices'
            )
        )
