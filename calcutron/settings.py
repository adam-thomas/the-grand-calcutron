import os

import dj_database_url

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DEBUG = bool(int(os.environ.get("DEBUG", 1)))

ALLOWED_HOSTS = ["*"] if DEBUG else ["the-grand-calcutron.herokuapp.com"]
BASE_URL = "https://the-grand-calcutron.herokuapp.com"

INSTALLED_APPS = (
    "calcutron",

    "django_extensions",
    "orderable",
    "whitenoise.runserver_nostatic",

    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
)

MIDDLEWARE = (
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
)

SECRET_KEY = "local_key" if DEBUG else os.environ.get("SECRET_KEY")

ROOT_URLCONF = "calcutron.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "calcutron.wsgi.application"

DATABASES = {
    "default": dj_database_url.config(
        default="postgres://localhost/calcutron",
    ),
}
DATABASES["default"]["ATOMIC_REQUESTS"] = True

LANGUAGE_CODE = "en-gb"
USE_TZ = False

STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
STATIC_URL = os.environ.get("STATIC_URL", "/static/")
STATICFILES_FINDERS = (
    "django.contrib.staticfiles.finders.AppDirectoriesFinder",
)

# WhiteNoise setup.
# Use compressed storage to reduce file sizes, and only keep hashed filenames.
STORAGES = {
    # https://whitenoise.readthedocs.io/en/latest/django.html#add-compression-and-caching-support
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}
WHITENOISE_KEEP_ONLY_HASHED_FILES = True

LOGIN_REDIRECT_URL = "/"
SECURE_SSL_REDIRECT = not DEBUG

DEBUG_PROPAGATE_EXCEPTIONS = True

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": ("%(asctime)s [%(process)d] [%(levelname)s] " +
                       "pathname=%(pathname)s lineno=%(lineno)s " +
                       "funcname=%(funcName)s %(message)s"),
            "datefmt": "%Y-%m-%d %H:%M:%S"
        },
        "simple": {
            "format": "%(levelname)s %(message)s"
        }
    },
    "handlers": {
        "null": {
            "level": "DEBUG",
            "class": "logging.NullHandler",
        },
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
            "formatter": "verbose"
        }
    },
    "loggers": {
        "testlogger": {
            "handlers": ["console"],
            "level": "INFO",
        }
    }
}

REST_FRAMEWORK = {
    # We have an Ajax-style API, so use the standard Django login page.
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],

    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

# Set up Heroku.
# The old django_heroku library is unmaintained, so we need to do this manually.
# Based on the example at:
# https://github.com/heroku/python-getting-started/blob/main/gettingstarted/settings.py
# I've copied the comments from that file as well just for reference.
IS_HEROKU_APP = "DYNO" in os.environ and "CI" not in os.environ

if IS_HEROKU_APP:
    # On Heroku, it's safe to use a wildcard for `ALLOWED_HOSTS`, since the Heroku router performs
    # validation of the Host header in the incoming HTTP request. On other platforms you may need to
    # list the expected hostnames explicitly in production to prevent HTTP Host header attacks. See:
    # https://docs.djangoproject.com/en/6.0/ref/settings/#std-setting-ALLOWED_HOSTS
    ALLOWED_HOSTS = ["*"]

    # Redirect all non-HTTPS requests to HTTPS. This requires that:
    # 1. Your app has a TLS/SSL certificate, which all `*.herokuapp.com` domains do by default.
    #    When using a custom domain, you must configure one. See:
    #    https://devcenter.heroku.com/articles/automated-certificate-management
    # 2. Your app's WSGI web server is configured to use the `X-Forwarded-Proto` headers set by
    #    the Heroku Router (otherwise you may encounter infinite HTTP 301 redirects). See this
    #    app's `gunicorn.conf.py` for how this is done when using gunicorn.
    #
    # For maximum security, consider enabling HTTP Strict Transport Security (HSTS) headers too:
    # https://docs.djangoproject.com/en/6.0/ref/middleware/#http-strict-transport-security
    SECURE_SSL_REDIRECT = True

    # In production on Heroku the database configuration is derived from the `DATABASE_URL`
    # environment variable by the dj-database-url package. `DATABASE_URL` will be set
    # automatically by Heroku when a database addon is attached to your Heroku app. See:
    # https://devcenter.heroku.com/articles/provisioning-heroku-postgres#application-config-vars
    # https://github.com/jazzband/dj-database-url
    DATABASES = {
        "default": dj_database_url.config(
            env="DATABASE_URL",
            conn_max_age=600,
            conn_health_checks=True,
            ssl_require=True,
        ),
    }
