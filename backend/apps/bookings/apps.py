from django.apps import AppConfig


class BookingsConfig(AppConfig):
    """Configuration for Bookings app."""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.bookings'
    verbose_name = 'Service Bookings'
