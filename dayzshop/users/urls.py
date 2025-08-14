from django.urls import path
from . import views


# app_name = 'users'

urlpatterns = [
    path("profile/", views.profile, name="profile"),
    path("login/", views.steam_login, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("steam/callback/", views.steam_callback, name="steam_callback"),
]
