from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


class CustomUserAdmin(UserAdmin):
    list_display = ("username", "steamid", "email", "is_staff")
    fieldsets = UserAdmin.fieldsets + (
        ("Steam данные", {"fields": ("steamid", "avatar", "profile_url")}),
    )


admin.site.register(User, CustomUserAdmin)
