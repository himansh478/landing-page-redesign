"""
Django settings for Landing Page Backend project.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-change-me-in-production')

DEBUG = os.getenv('DEBUG', 'False') == 'True'
# *.zip
# hostinger-backend-upload.zip
# hostinger-frontend-upload.zip

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'apps.bookings',
    'django_ratelimit',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
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

WSGI_APPLICATION = 'config.wsgi.application'

import dj_database_url

DATABASE_URL = os.getenv('DATABASE_URL')

if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'landing_page_db'),
            'USER': os.getenv('DB_USER', 'postgres'),
            'PASSWORD': os.getenv('DB_PASSWORD', ''),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
}

# CORS Configuration - Allow all origins (testing)
# CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "https://landing-page-redesign-beta.vercel.app",
    "http://localhost:5173",
]
CORS_ALLOW_CREDENTIALS = True

# """

# Django settings for Landing Page Backend project.

# """

# import os

# from pathlib import Path

# from dotenv import load_dotenv


# load_dotenv()


# BASE_DIR = Path(__file__).resolve().parent.parent


# SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-change-me-in-production')


# DEBUG = os.getenv('DEBUG', 'True') == 'True'


# ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')


# INSTALLED_APPS = [

#     'django.contrib.admin',

#     'django.contrib.auth',

#     'django.contrib.contenttypes',

#     'django.contrib.sessions',

#     'django.contrib.messages',

#     'django.contrib.staticfiles',

#     'rest_framework',

#     'corsheaders',

#     'apps.bookings',

# ]


# MIDDLEWARE = [

#     'django.middleware.security.SecurityMiddleware',

#     # WhiteNoise - serves static files in production (add right after SecurityMiddleware)
#     'whitenoise.middleware.WhiteNoiseMiddleware',

#     'django.contrib.sessions.middleware.SessionMiddleware',

#     'corsheaders.middleware.CorsMiddleware',

#     'django.middleware.common.CommonMiddleware',

#     'django.middleware.csrf.CsrfViewMiddleware',

#     'django.contrib.auth.middleware.AuthenticationMiddleware',

#     'django.contrib.messages.middleware.MessageMiddleware',

#     'django.middleware.clickjacking.XFrameOptionsMiddleware',

# ]


# ROOT_URLCONF = 'config.urls'


# TEMPLATES = [

#     {

#         'BACKEND': 'django.template.backends.django.DjangoTemplates',

#         'DIRS': [BASE_DIR / 'templates'],

#         'APP_DIRS': True,

#         'OPTIONS': {

#             'context_processors': [

#                 'django.template.context_processors.debug',

#                 'django.template.context_processors.request',

#                 'django.contrib.auth.context_processors.auth',

#                 'django.contrib.messages.context_processors.messages',

#             ],

#         },

#     },

# ]


# WSGI_APPLICATION = 'config.wsgi.application'


# # Database Configuration - PostgreSQL (.env se credentials)
# # Database Configuration - Railway PostgreSQL
# import dj_database_url

# DATABASE_URL = os.getenv('DATABASE_URL')

# if DATABASE_URL:
#     # Production - Railway
#     DATABASES = {
#         'default': dj_database_url.config(
#             default=DATABASE_URL,
#             conn_max_age=600,
#         )
#     }
# else:
#     # Local development fallback
#     DATABASES = {
#         'default': {
#             'ENGINE': 'django.db.backends.postgresql',
#             'NAME': os.getenv('DB_NAME', 'landing_page_db'),
#             'USER': os.getenv('DB_USER', 'postgres'),
#             'PASSWORD': os.getenv('DB_PASSWORD', ''),
#             'HOST': os.getenv('DB_HOST', 'localhost'),
#             'PORT': os.getenv('DB_PORT', '5432'),
#         }
#     }

# AUTH_PASSWORD_VALIDATORS = [

#     {

#         'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',

#     },

#     {

#         'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',

#     },

#     {

#         'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',

#     },

#     {

#         'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',

#     },

# ]


# LANGUAGE_CODE = 'en-us'

# TIME_ZONE = 'UTC'

# USE_I18N = True

# USE_TZ = True


# STATIC_URL = '/static/'

# STATIC_ROOT = BASE_DIR / 'staticfiles'

# STATICFILES_DIRS = [BASE_DIR / 'static']

# # WhiteNoise compressed static files for production
# STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# # HTTPS Security (Hostinger SSL)
# SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')


# MEDIA_URL = '/media/'

# MEDIA_ROOT = BASE_DIR / 'media'


# DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# # REST Framework Configuration

# REST_FRAMEWORK = {

#     'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',

#     'PAGE_SIZE': 10,

#     'DEFAULT_AUTHENTICATION_CLASSES': [

#         'rest_framework.authentication.SessionAuthentication',

#     ],

#     'DEFAULT_PERMISSION_CLASSES': [

#         'rest_framework.permissions.AllowAny',

#     ],

# }


# # CORS Configuration

# CORS_ALLOWED_ORIGINS = os.getenv(

#     'CORS_ALLOWED_ORIGINS',

#     'http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174'

# ).split(',')


# CORS_ALLOW_CREDENTIALS = True

