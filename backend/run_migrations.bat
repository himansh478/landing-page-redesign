@echo off
REM Quick setup script for Windows - Run this after installing dependencies

echo.
echo ====================================
echo Django Backend Setup Script
echo ====================================
echo.

REM Uncomment to create migrations
echo Creating migrations...
python manage.py makemigrations

echo.
echo Applying migrations...
python manage.py migrate

echo.
echo Django setup complete!
echo.
echo Next steps:
echo 1. Create superuser: python manage.py createsuperuser
echo 2. Start server: python manage.py runserver
echo.
echo Admin will be available at: http://localhost:8000/admin
echo.
pause
