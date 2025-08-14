import os
from pathlib import Path
from dotenv import load_dotenv


load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("SECRET_KEY")

DEBUG = True

ALLOWED_HOSTS = []

AUTH_USER_MODEL = "users.User"

INSTALLED_APPS = [
    "users.apps.UsersConfig",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.humanize",
    "cart.apps.CartConfig",
    "shop.apps.ShopConfig",
    "bootstrap5",
    "social_django",
    'django_extensions',
]


MIDDLEWARE = [
    "social_django.middleware.SocialAuthExceptionMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    'django.middleware.locale.LocaleMiddleware',
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


ROOT_URLCONF = "dayzshop.urls"


TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(BASE_DIR, "templates")],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                'django.template.context_processors.i18n',
                "cart.context_processors.cart",
            ],
        },
    },
]


WSGI_APPLICATION = "dayzshop.wsgi.application"


DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

AUTHENTICATION_BACKENDS = (
    "users.backends.CustomSteamOpenId",
    "django.contrib.auth.backends.ModelBackend",
)

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

SOCIAL_AUTH_PIPELINE = (
    "social_core.pipeline.social_auth.social_details",
    "social_core.pipeline.social_auth.social_uid",
    "social_core.pipeline.social_auth.auth_allowed",
    "social_core.pipeline.social_auth.social_user",
    "social_core.pipeline.user.get_username",
    "users.pipeline.get_steam_user_data",
    "social_core.pipeline.user.create_user",
    "social_core.pipeline.social_auth.associate_user",
    "social_core.pipeline.social_auth.load_extra_data",
    "social_core.pipeline.user.user_details",
)

LANGUAGE_CODE = 'ru'
LANGUAGES = (
    ('ru', 'Русский'),
    ('en', 'English'),
)

LOCALE_PATHS = [
    os.path.join(BASE_DIR, 'locale'),
]


USE_I18N = True
USE_L10N = True
# USE_TZ = True

# TIME_ZONE = "UTC"


STATIC_URL = "/static/"
STATICFILES_DIRS = [os.path.join(BASE_DIR, "static")]
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.yandex.ru"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = "your_email@yandex.ru"
EMAIL_HOST_PASSWORD = "your_password"
DEFAULT_FROM_EMAIL = "your_email@yandex.ru"
CONTACT_EMAIL = "contact@yourdomain.com"

USE_THOUSAND_SEPARATOR = True

# STEAM_API_KEY = os.getenv('STEAM_API_KEY')
# STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login'
# STEAM_EXTRA_DATA = ['avatarfull', 'realname']

SOCIAL_AUTH_STEAM_EXTRA_DATA = ["player"]
LOGIN_REDIRECT_URL = "profile"

# SOCIAL_AUTH_STEAM_API_URL = 'https://api.steampowered.com/'
# SOCIAL_AUTH_LOGIN_REDIRECT_URL = '/profile/'
