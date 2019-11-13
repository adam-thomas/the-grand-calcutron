import os

import django_heroku
import dj_database_url

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# TODO: Figure out why this doesn't work on Heroku - I assume it's submitting a string of "0" or "False"
DEBUG = bool(os.environ.get('DEBUG', False))

# ALLOWED_HOSTS = ['*'] if DEBUG else ["the-grand-calcutron.herokuapp.com"]
ALLOWED_HOSTS = ["the-grand-calcutron.herokuapp.com"]
BASE_URL = "https://the-grand-calcutron.herokuapp.com"

INSTALLED_APPS = (
    'calcutron',

    'django_extensions',
    'orderable',

    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
)

MIDDLEWARE = (
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

# SECRET_KEY = "local_key" if DEBUG else os.environ.get("SECRET_KEY")
SECRET_KEY = os.environ.get("SECRET_KEY")

ROOT_URLCONF = 'calcutron.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'calcutron.wsgi.application'

DATABASES = {
    'default': dj_database_url.config(
        default='postgres://localhost/calcutron',
    ),
}
DATABASES['default']['ATOMIC_REQUESTS'] = True

LANGUAGE_CODE = 'en-gb'
USE_TZ = False

STATIC_ROOT = os.path.join(BASE_DIR, 'calcutron/static')
STATIC_URL = os.environ.get('STATIC_URL', '/static/')

LOGIN_REDIRECT_URL = "/"
SECURE_SSL_REDIRECT = not DEBUG

# Activate Django-Heroku.
django_heroku.settings(locals())
