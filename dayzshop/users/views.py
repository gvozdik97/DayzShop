from django.shortcuts import redirect, render
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from social_django.utils import psa
import logging
from django.contrib.auth.decorators import login_required


logger = logging.getLogger(__name__)


def steam_login(request):
    return redirect("social:begin", backend="steam")


@psa("social:complete")
def steam_callback(request):
    return redirect("profile")


@login_required
def profile(request):
    return render(
        request,
        "users/profile.html",
        {
            "user": request.user,
            "steamid": request.user.steamid,
        },
    )


@login_required
def logout_view(request):
    logout(request)
    return redirect("shop:index")
