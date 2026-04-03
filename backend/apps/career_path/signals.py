"""SharedPlan.comment_count 를 댓글 테이블과 동기화."""

from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import SharedPlan, SharedPlanComment


def _recount_shared_plan_comments(shared_plan_id):
    n = SharedPlanComment.objects.filter(shared_plan_id=shared_plan_id).count()
    SharedPlan.objects.filter(pk=shared_plan_id).update(comment_count=n)


@receiver(post_save, sender=SharedPlanComment)
def shared_plan_comment_saved(sender, instance, **kwargs):
    _recount_shared_plan_comments(instance.shared_plan_id)


@receiver(post_delete, sender=SharedPlanComment)
def shared_plan_comment_deleted(sender, instance, **kwargs):
    _recount_shared_plan_comments(instance.shared_plan_id)
