import sys
import os

# Add your backend project directory to path
# Change 'shivexa' to your actual Hostinger username
sys.path.insert(0, '/home/shivexa/backend')
sys.path.insert(0, '/home/shivexa/backend/venv/lib/python3.11/site-packages')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
