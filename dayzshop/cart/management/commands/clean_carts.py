from django.core.management.base import BaseCommand
from django.utils import timezone
from cart.models import Cart


class Command(BaseCommand):
    def handle(self, *args, **options):
        expired = Cart.objects.filter(
            created_at__lt=timezone.now() - timezone.timedelta(days=30),
            user__isnull=True,
        ).delete()
        self.stdout.write(f"Deleted {expired} old carts")
