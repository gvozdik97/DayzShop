from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from users import views as user_views
from django.conf.urls.i18n import i18n_patterns


base_urlpatterns = [
    path('i18n/', include('django.conf.urls.i18n')),  # Должен быть первым!
    path('admin/', admin.site.urls),
]

localized_urlpatterns = i18n_patterns(
    path("users/", include("users.urls")),
    path("", include("shop.urls", namespace="shop")),
    path("cart/", include("cart.urls", namespace="cart")),
    path("auth/", include("social_django.urls", namespace="social")),
    path("login/", user_views.steam_login, name="login"),
    path("logout/", user_views.logout_view, name="logout"),
    prefix_default_language=False
)

urlpatterns = base_urlpatterns + localized_urlpatterns + static(
    settings.MEDIA_URL, 
    document_root=settings.MEDIA_ROOT
)