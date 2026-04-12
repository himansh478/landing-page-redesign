# Backend Setup Instructions

## Prerequisites
- Python 3.10+ installed
- PostgreSQL 12+ installed and running
- pip package manager

## Step 1: Create Virtual Environment
```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

## Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

## Step 3: Create .env File
Copy `.env.example` to `.env` and update with your credentials:
```bash
cp .env.example .env
```

Update your PostgreSQL credentials in `.env`:
```
DB_PASSWORD=your-actual-postgres-password
DB_NAME=landing_page_db
DB_USER=postgres
DB_HOST=localhost
DB_PORT=5432
```

## Step 4: Create PostgreSQL Database
```bash
# Using psql (PostgreSQL CLI)
psql -U postgres
CREATE DATABASE landing_page_db;
\q
```

## Step 5: Run Migrations
```bash
python manage.py migrate
```

## Step 6: Create Superuser (Admin)
```bash
python manage.py createsuperuser
```

## Step 7: Run Development Server
```bash
python manage.py runserver
```

The server will start at: `http://localhost:8000`
Admin panel: `http://localhost:8000/admin`

## Project Structure
```
backend/
├── config/                 # Project configuration
│   ├── settings.py        # Django settings
│   ├── urls.py            # URL routing
│   ├── wsgi.py            # Production WSGI
│   └── asgi.py            # Async ASGI
├── apps/                  # Django apps
├── static/                # Static files (CSS, JS)
├── media/                 # User uploaded files
├── manage.py             # Django management script
├── requirements.txt      # Python dependencies
├── .env.example         # Environment variables example
└── README.md            # This file
```

## Commands Reference

### Database Operations
```bash
python manage.py makemigrations          # Create migrations
python manage.py migrate                 # Apply migrations
python manage.py showmigrations          # Show migration status
```

### Server Management
```bash
python manage.py runserver               # Start dev server
python manage.py runserver 0.0.0.0:8000 # Run on all addresses
```

### Admin Operations
```bash
python manage.py createsuperuser         # Create admin user
python manage.py changepassword          # Change user password
```

### Utilities
```bash
python manage.py shell                   # Django Python shell
python manage.py collectstatic          # Collect static files
```

## Creating a New App
```bash
python manage.py startapp app_name
```

Then add the app to `INSTALLED_APPS` in `config/settings.py`.

## Connecting to Frontend (React)
The frontend is configured to make requests to:
- Default: `http://localhost:8000`
- CORS is enabled for `http://localhost:5173`

Update the `.env` file with your frontend URL if different.

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running: `psql -U postgres`
- Check DB credentials in `.env` file
- Verify database exists: `CREATE DATABASE landing_page_db;`

### Port Already in Use
```bash
# Run on different port
python manage.py runserver 8001
```

### ModuleNotFoundError
- Ensure virtual environment is activated
- Run: `pip install -r requirements.txt`

## Additional Resources
- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
