"""
Create ExecutionPlan + PlanItem rows from blueprint JSON (demo / seed).
Requires an existing user (--user-email).
"""

import json
from pathlib import Path

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from apps.career_plan.models import ExecutionPlan, PlanItem

User = get_user_model()


class Command(BaseCommand):
    help = "Import execution plans from career_plan_blueprints.json for one user"

    def add_arguments(self, parser):
        parser.add_argument(
            "--json-path",
            type=str,
            default=None,
            help="Path to career_plan_blueprints.json",
        )
        parser.add_argument(
            "--user-email",
            type=str,
            required=True,
            help="Email of the user who will own these plans",
        )
        parser.add_argument(
            "--clear-existing",
            action="store_true",
            help="Delete this user's execution plans before import",
        )

    def handle(self, *args, **options):
        base = Path(__file__).resolve().parents[4]
        json_path = options["json_path"] or base / "data" / "seed" / "career_plan_blueprints.json"
        path = Path(json_path)
        if not path.is_file():
            self.stderr.write(self.style.ERROR(f"File not found: {path}"))
            return

        try:
            user = User.objects.get(email=options["user_email"])
        except User.DoesNotExist:
            self.stderr.write(self.style.ERROR(f"User not found: {options['user_email']}"))
            return

        if options["clear_existing"]:
            n, _ = ExecutionPlan.objects.filter(user=user).delete()
            self.stdout.write(self.style.WARNING(f"Removed {n} related rows for user"))

        with path.open(encoding="utf-8") as f:
            data = json.load(f)

        created = 0
        for bp in data.get("blueprints", []):
            plan = ExecutionPlan.objects.create(
                user=user,
                title=bp["title"],
                description=bp.get("description", ""),
                status="todo",
                priority=bp.get("priority", "medium"),
                progress_percentage=0,
            )
            for it in bp.get("items", []):
                PlanItem.objects.create(
                    plan=plan,
                    title=it["title"],
                    description=it.get("description", ""),
                    status=it.get("status", "todo"),
                    order_index=it.get("order_index", 0),
                )
            created += 1
            self.stdout.write(self.style.SUCCESS(f"OK: {bp.get('slug', plan.id)}"))

        self.stdout.write(self.style.SUCCESS(f"Imported {created} execution plans for {user.email}"))
