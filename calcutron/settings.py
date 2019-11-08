import os

import django_heroku
import dj_database_url

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DEBUG = bool(os.environ.get('DEBUG', True))

ALLOWED_HOSTS = ['*']

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

SECRET_KEY = 'Django requires this to be set, but this project does not make use of it'

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

# Activate Django-Heroku.
django_heroku.settings(locals())
