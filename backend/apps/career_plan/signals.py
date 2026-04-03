"""SharedDreamRoadmap.comment_count 를 댓글 테이블과 동기화."""

from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import SharedDreamRoadmap, SharedDreamRoadmapComment


def _recount_shared_dream_comments(shared_roadmap_id):
    n = SharedDreamRoadmapComment.objects.filter(shared_roadmap_id=shared_roadmap_id).count()
    SharedDreamRoadmap.objects.filter(pk=shared_roadmap_id).update(comment_count=n)


@receiver(post_save, sender=SharedDreamRoadmapComment)
def shared_dream_roadmap_comment_saved(sender, instance, **kwargs):
    _recount_shared_dream_comments(instance.shared_roadmap_id)


@receiver(post_delete, sender=SharedDreamRoadmapComment)
def shared_dream_roadmap_comment_deleted(sender, instance, **kwargs):
    _recount_shared_dream_comments(instance.shared_roadmap_id)
