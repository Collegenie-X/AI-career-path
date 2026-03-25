"""
Load CareerPathTemplate + TemplateYear + TemplateItem from JSON.
"""

import json
from pathlib import Path

from django.core.management.base import BaseCommand

from apps.career_path.models import CareerPathTemplate, TemplateItem, TemplateYear


class Command(BaseCommand):
    help = "Import career path templates from career_path_templates.json"

    def add_arguments(self, parser):
        parser.add_argument(
            "--json-path",
            type=str,
            default=None,
            help="Path to career_path_templates.json (default: backend/data/seed/career_path_templates.json)",
        )
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete existing templates with same template_key before import",
        )

    def handle(self, *args, **options):
        base = Path(__file__).resolve().parents[4]
        json_path = options["json_path"] or base / "data" / "seed" / "career_path_templates.json"
        path = Path(json_path)
        if not path.is_file():
            self.stderr.write(self.style.ERROR(f"File not found: {path}"))
            return

        with path.open(encoding="utf-8") as f:
            data = json.load(f)

        templates = data.get("templates", [])
        created_t = 0
        updated_t = 0

        for t in templates:
            key = t["template_key"]
            template, was_created = CareerPathTemplate.objects.update_or_create(
                template_key=key,
                defaults={
                    "title": t["title"],
                    "category": t.get("category", "general"),
                    "job_id": t.get("job_id") or "",
                    "university_id": t.get("university_id") or "",
                    "description": t.get("description", ""),
                    "likes": t.get("likes", 0),
                    "uses": t.get("uses", 0),
                    "is_official": t.get("is_official", True),
                    "is_active": True,
                },
            )
            if was_created:
                created_t += 1
            else:
                updated_t += 1

            template.years.all().delete()

            for y in t.get("years", []):
                ty = TemplateYear.objects.create(
                    template=template,
                    year=y["year"],
                    order_index=y.get("order_index", 0),
                )
                for it in y.get("items", []):
                    TemplateItem.objects.create(
                        year=ty,
                        item_type=it.get("item_type", "activity"),
                        title=it["title"],
                        description=it.get("description", ""),
                        month=it.get("month"),
                        emoji=it.get("emoji", "📌"),
                        order_index=it.get("order_index", 0),
                    )

            self.stdout.write(self.style.SUCCESS(f"OK: {template.template_key}"))

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. templates created={created_t}, updated={updated_t}, total keys={len(templates)}"
            )
        )
