#!/bin/bash
# Linux/macOS setup script for Django backend

echo "Creating virtual environment..."
python3 -m venv venv

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "Setup complete! Follow these steps:"
echo ""
echo "1. Configure your .env file:"
echo "   cp .env.example .env"
echo "   (Update with your PostgreSQL credentials)"
echo ""
echo "2. Create PostgreSQL database:"
echo "   psql -U postgres"
echo "   CREATE DATABASE landing_page_db;"
echo "   \q"
echo ""
echo "3. Run migrations:"
echo "   python manage.py migrate"
echo ""
echo "4. Create superuser:"
echo "   python manage.py createsuperuser"
echo ""
echo "5. Start the server:"
echo "   python manage.py runserver"
echo ""
