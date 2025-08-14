from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    steamid = models.CharField(
        max_length=17, unique=True, null=True, blank=True, verbose_name="Steam ID"
    )
    avatar = models.URLField(max_length=255, blank=True)
    profile_url = models.URLField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.username} (SteamID: {self.steamid})"
