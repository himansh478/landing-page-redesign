# Database Setup Instructions

## Step-by-Step Setup Guide

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Activate Virtual Environment
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Create & Configure .env File
```bash
# Copy the example file
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac

# Edit .env with your PostgreSQL credentials
```

### 5. Create PostgreSQL Database
```bash
# Open PostgreSQL CLI
psql -U postgres

# Create database
CREATE DATABASE landing_page_db;

# Exit psql
\q
```

### 6. Run Migrations
```bash
# Create migration files
python manage.py makemigrations

# Apply migrations to database
python manage.py migrate
```

### 7. Create Superuser (Admin Account)
```bash
python manage.py createsuperuser
# Enter username, email, and password
```

### 8. Start Development Server
```bash
python manage.py runserver
```

Server will run at: http://localhost:8000

### 9. Access Admin Panel
```
URL: http://localhost:8000/admin
Username: Your superuser username
Password: Your superuser password
```

## API Endpoints

### Service Bookings Endpoints

#### Create Booking (Public - No Auth Required)
```
POST /api/bookings/
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "whatsapp_number": "+91 9876543210",
  "service_type": "Vlog Edit",
  "project_title": "My Awesome Vlog",
  "description": "Professional editing needed",
  "video_duration": "5-15 minutes",
  "content_type": "YouTube Video",
  "budget": "₹1000-2500",
  "timeline": "1-2 weeks",
  "reference_video_link": "https://youtu.be/...",
  "portfolio_link": "https://myportfolio.com"
}
```

**Success Response (201):**
```json
{
  "message": "Service booking received successfully! We will contact you soon.",
  "booking_id": 1,
  "data": {
    "id": 1,
    "name": "John Doe",
    "service_type": "Vlog Edit",
    ...
  }
}
```

#### Get All Bookings (Admin Only)
```
GET /api/bookings/
```

Headers Required:
```
Authorization: Bearer <token>
```

#### Get Single Booking (Admin Only)
```
GET /api/bookings/{id}/
```

#### Update Booking Status (Admin Only)
```
PATCH /api/bookings/{id}/update_status/
```

**Request Body:**
```json
{
  "status": "contacted",
  "admin_notes": "Contacted customer on WhatsApp"
}
```

#### Get Statistics (Admin Only)
```
GET /api/bookings/statistics/
```

**Response:**
```json
{
  "total_bookings": 10,
  "pending_bookings": 5,
  "completed_bookings": 3,
  "service_counts": {
    "Vlog Edit": 4,
    "Wedding Edit": 3,
    ...
  }
}
```

#### Bulk Update Status (Admin Only)
```
POST /api/bookings/bulk_update_status/
```

**Request Body:**
```json
{
  "booking_ids": [1, 2, 3],
  "status": "contacted"
}
```

## Admin Features

### Service Bookings Admin Panel
Features available at `/admin/bookings/servicebooking/`:

1. **List View** - See all bookings with filters
   - Filter by Status (Pending, Contacted, In Progress, Completed, Rejected)
   - Filter by Service Type (Vlog Edit, Documentary, etc.)
   - Filter by Content Type
   - Filter by Budget
   - Filter by Date

2. **Search** - Search by:
   - Customer Name
   - Email Address
   - WhatsApp Number
   - Project Title

3. **Edit Booking** - Update:
   - Status (with color-coded badges)
   - Admin Notes
   - All booking details

4. **Status Badges** - Visual indicators
   - 🟠 Pending (Orange)
   - 🔵 Contacted (Light Blue)
   - 🟢 In Progress (Light Green)
   - ✅ Completed (Green)
   - ❌ Rejected (Red)

## Troubleshooting

### Migration Errors
```bash
# Reset migrations (careful - deletes data)
python manage.py migrate apps.bookings zero
python manage.py migrate

# Or view migration history
python manage.py showmigrations apps.bookings
```

### Superuser Forgotten
```bash
python manage.py changepassword <username>
```

### Database Connection Issues
```bash
# Check PostgreSQL is running
# Windows: Services -> PostgreSQL
# Mac: brew services start postgresql@14
# Linux: sudo systemctl start postgresql
```

## Production Deployment Checklist

- [ ] Set `DEBUG=False` in `.env`
- [ ] Add production database credentials
- [ ] Update `ALLOWED_HOSTS` with your domain
- [ ] Update `CORS_ALLOWED_ORIGINS` with frontend URL
- [ ] Generate new `SECRET_KEY`
- [ ] Run `python manage.py collectstatic`
- [ ] Set up SSL/HTTPS certificate
- [ ] Use production WSGI server (Gunicorn)
- [ ] Set up PostgreSQL backups

## Useful Commands

```bash
# Create new app
python manage.py startapp app_name

# Database shell
python manage.py dbshell

# Django shell
python manage.py shell

# Collect static files
python manage.py collectstatic

# Check for issues
python manage.py check

# Export data
python manage.py dumpdata > backup.json

# Import data
python manage.py loaddata backup.json
```
