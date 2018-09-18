# Copyright (C) 2018 by eHealth Africa : http://www.eHealthAfrica.org
#
# See the NOTICE file distributed with this work for additional information
# regarding copyright ownership.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

import logging
import os

# ------------------------------------------------------------------------------
# Common settings
# ------------------------------------------------------------------------------

# Environment variables are false if unset or set to empty string, anything
# else is considered true.
DEBUG = bool(os.environ.get('DEBUG'))
TESTING = bool(os.environ.get('TESTING'))
SECRET_KEY = os.environ['DJANGO_SECRET_KEY']

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = os.environ.get('STATIC_ROOT', '/var/www/static/')


# Django Basic Configuration
# ------------------------------------------------------------------------------

INSTALLED_APPS = [
    # Basic Django
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.messages',
    'django.contrib.postgres',
    'django.contrib.sessions',
    'django.contrib.staticfiles',

    # REST framework with auth token
    'rest_framework',
    'rest_framework.authtoken',

    # CORS checking
    'corsheaders',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.media',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


# REST Framework Configuration
# ------------------------------------------------------------------------------

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
        'rest_framework.renderers.AdminRenderer',
    ),
    'DEFAULT_PARSER_CLASSES': (
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
}


# Database Configuration
# ------------------------------------------------------------------------------

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': os.environ['DB_NAME'],
        'PASSWORD': os.environ['PGPASSWORD'],
        'USER': os.environ['PGUSER'],
        'HOST': os.environ['PGHOST'],
        'PORT': os.environ['PGPORT'],
        'TESTING': {'CHARSET': 'UTF8'},
    },
}


# Logging Configuration
# ------------------------------------------------------------------------------

# https://docs.python.org/3.6/library/logging.html#levels
LOGGING_LEVEL = os.environ.get('LOGGING_LEVEL', logging.INFO)
LOGGING_CLASS = 'logging.StreamHandler'

if TESTING:
    LOGGING_CLASS = 'logging.NullHandler'

logger = logging.getLogger(__name__)
logger.setLevel(LOGGING_LEVEL)


SENTRY_DSN = os.environ.get('SENTRY_DSN')
if SENTRY_DSN:
    INSTALLED_APPS += ['raven.contrib.django.raven_compat', ]
    MIDDLEWARE = [
        'raven.contrib.django.raven_compat.middleware.SentryResponseErrorIdMiddleware',
    ] + MIDDLEWARE

    SENTRY_CLIENT = 'raven.contrib.django.raven_compat.DjangoClient'
    SENTRY_CELERY_LOGLEVEL = LOGGING_LEVEL

    LOGGING_CLASS = 'raven.contrib.django.raven_compat.handlers.SentryHandler'

else:
    logger.info('No SENTRY enabled!')


LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'root': {
        'level': LOGGING_LEVEL,
        'handlers': ['gather_handler'],
    },
    'formatters': {
        'verbose': {
            'format': '%(levelname)s  %(asctime)s  %(module)s  %(process)d  %(thread)d  %(message)s'
        },
    },
    'handlers': {
        'gather_handler': {
            'level': LOGGING_LEVEL,
            'class': LOGGING_CLASS,
            'formatter': 'verbose',
        },
        'console': {
            'level': LOGGING_LEVEL,
            'class': 'logging.StreamHandler' if not TESTING else 'logging.NullHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'gather': {
            'level': LOGGING_LEVEL,
            'handlers': ['console', 'gather_handler'],
            'propagate': False,
        },
        'django': {
            'level': LOGGING_LEVEL,
            'handlers': ['console', 'gather_handler'],
            'propagate': False,
        },
        # These ones are available with Sentry enabled
        'raven': {
            'level': 'ERROR',
            'handlers': ['console', 'gather_handler'],
            'propagate': False,
        },
        'sentry.errors': {
            'level': 'ERROR',
            'handlers': ['console', 'gather_handler'],
            'propagate': False,
        },
    },
}


# Authentication Configuration
# ------------------------------------------------------------------------------

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 10,
        },
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

CAS_SERVER_URL = os.environ.get('CAS_SERVER_URL')
if CAS_SERVER_URL:
    INSTALLED_APPS += [
        # CAS apps
        'django_cas_ng',
        'ums_client',
    ]
    AUTHENTICATION_BACKENDS += [
        'ums_client.backends.UMSRoleBackend',
    ]
    CAS_VERSION = 3
    CAS_LOGOUT_COMPLETELY = True
    HOSTNAME = os.environ.get('HOSTNAME', '')

else:
    logger.info('No CAS enabled!')

    LOGIN_TEMPLATE = os.environ.get('LOGIN_TEMPLATE', 'pages/login.html')
    LOGGED_OUT_TEMPLATE = os.environ.get('LOGGED_OUT_TEMPLATE', 'pages/logged_out.html')


# Security Configuration
# ------------------------------------------------------------------------------

ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', '*').split(',')

CORS_ORIGIN_ALLOW_ALL = True

CSRF_COOKIE_DOMAIN = os.environ.get('CSRF_COOKIE_DOMAIN', '.gather.org')
CSRF_TRUSTED_ORIGINS = os.environ.get('CSRF_TRUSTED_ORIGINS', CSRF_COOKIE_DOMAIN).split(',')
SESSION_COOKIE_DOMAIN = CSRF_COOKIE_DOMAIN

if os.environ.get('DJANGO_USE_X_FORWARDED_HOST', False):
    USE_X_FORWARDED_HOST = True

if os.environ.get('DJANGO_USE_X_FORWARDED_PORT', False):
    USE_X_FORWARDED_PORT = True

if os.environ.get('DJANGO_HTTP_X_FORWARDED_PROTO', False):
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')


# Debug Configuration
# ------------------------------------------------------------------------------

if not TESTING and DEBUG:
    INSTALLED_APPS += ['debug_toolbar', ]
    MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware', ]

    DEBUG_TOOLBAR_CONFIG = {
        'SHOW_TOOLBAR_CALLBACK': lambda _: True,
        'SHOW_TEMPLATE_CONTEXT': True,
    }


# ------------------------------------------------------------------------------
# Gather Configuration
# ------------------------------------------------------------------------------

ROOT_URLCONF = 'gather.urls'

APP_NAME = 'Gather'
INSTANCE_NAME = os.environ.get('INSTANCE_NAME', 'Gather 3')

DATA_UPLOAD_MAX_MEMORY_SIZE = 50 * 1024 * 1024  # 50MB

# Javascript/CSS Files:
WEBPACK_LOADER = {
    'DEFAULT': {
        'CACHE': not DEBUG,
        'BUNDLE_DIR_NAME': '/',
        'STATS_FILE': os.path.join(STATIC_ROOT, 'webpack-stats.json'),
        'POLL_INTERVAL': 0.1,  # in miliseconds
        'TIMEOUT': None,
        'IGNORE': ['.+\.hot-update.js', '.+\.map'],
    },
}

INSTALLED_APPS += [
    'webpack_loader',
    'gather',
]

TEMPLATES[0]['OPTIONS']['context_processors'] += [
    'gather.context_processors.gather_context',
]

MIGRATION_MODULES = {
    'gather': 'gather.api.migrations'
}

# ------------------------------------------------------------------------------
# Aether external modules
# ------------------------------------------------------------------------------

AETHER_APPS = {}

# check the available modules linked to this instance
AETHER_MODULES = [
    x
    for x in map(str.strip, os.environ.get('AETHER_MODULES', '').split(','))
    if x
]


# KERNEL is always a linked module
kernel = {
    'token': os.environ.get('AETHER_KERNEL_TOKEN'),
    'url': os.environ.get('AETHER_KERNEL_URL'),
    'assets': os.environ.get('AETHER_KERNEL_URL_ASSETS', os.environ.get('AETHER_KERNEL_URL')),
}
if TESTING:
    kernel['url'] = os.environ.get('AETHER_KERNEL_URL_TEST')

if kernel['url'].strip() and kernel['token'].strip():
    AETHER_APPS['kernel'] = kernel
else:
    msg = 'Aether Kernel configuration was not properly set!'
    logger.critical(msg)
    raise RuntimeError(msg)


# check if ODK is available in this instance
AETHER_ODK = False
if 'odk' in AETHER_MODULES:
    odk = {
        'token': os.environ.get('AETHER_ODK_TOKEN'),
        'url': os.environ.get('AETHER_ODK_URL'),
        'assets': os.environ.get('AETHER_ODK_URL_ASSETS', os.environ.get('AETHER_ODK_URL')),
    }
    if TESTING:
        odk['url'] = os.environ.get('AETHER_ODK_URL_TEST')

    if odk['url'].strip() and odk['token'].strip():
        AETHER_APPS['odk'] = odk
        AETHER_ODK = True
    else:
        msg = 'Aether ODK configuration was not properly set!'
        logger.critical(msg)
        raise RuntimeError(msg)

# Asset settings
CSV_HEADER_RULES = os.environ.get(
    'CSV_HEADER_RULES',
    'remove-prefix;payload.,remove-prefix;None.,replace;.;:;'
)
CSV_HEADER_RULES_SEP = os.environ.get('CSV_HEADER_RULES_SEP', ';')
CSV_MAX_ROWS_SIZE = os.environ.get('CSV_MAX_ROWS_SIZE', '0')


# ------------------------------------------------------------------------------
# Local Configuration
# ------------------------------------------------------------------------------
# This scriptlet allows you to include custom settings in your local environment

try:
    from local_settings import *  # noqa
except ImportError:
    logger.debug('No local settings!')