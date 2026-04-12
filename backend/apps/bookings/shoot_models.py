from django.db import models


class ShootBooking(models.Model):
    """Model to store professional shoot booking requests."""
    
    SHOOT_TYPE_CHOICES = [
        ('Wedding Shoot', 'Wedding Shoot'),
        ('Insta & YouTube Video Shoot', 'Insta & YouTube Video Shoot'),
        ('Commercial Shoot', 'Commercial Shoot'),
        ('Corporate Event Shoot', 'Corporate Event Shoot'),
        ('Marketing Shoot', 'Marketing Shoot'),
        ('Religious Shoot', 'Religious Shoot'),
        ('Political Shoot', 'Political Shoot'),
        ('Cinematic Shoot', 'Cinematic Shoot'),
    ]
    
    BUDGET_CHOICES = [
        ('₹0-500', '₹0-500'),
        ('₹500-1000', '₹500-1000'),
        ('₹1000-2500', '₹1000-2500'),
        ('₹2500-5000', '₹2500-5000'),
        ('₹5000+', '₹5000+'),
    ]
    
    TIMELINE_CHOICES = [
        ('Urgent (24-48 hours)', 'Urgent (24-48 hours)'),
        ('ASAP (3-7 days)', 'ASAP (3-7 days)'),
        ('1-2 weeks', '1-2 weeks'),
        ('2-4 weeks', '2-4 weeks'),
        ('Flexible', 'Flexible'),
    ]
    
    LOCATION_CHOICES = [
        ('sehore', 'Sehore'),
        ('bhopal', 'Bhopal'),
        ('Indore', 'Indore'),
        ('Gwalior', 'Gwalior'),
        ('Ujjain', 'Ujjain'),
        ('Jabalpur', 'Jabalpur'),
        ('Mumbai', 'Mumbai'),
        ('Delhi', 'Delhi'),
        ('Bangalore', 'Bangalore'),
        ('Hyderabad', 'Hyderabad'),
        ('Chennai', 'Chennai'),
        ('Kolkata', 'Kolkata'),
        ('Pune', 'Pune'),
        ('Ahmedabad', 'Ahmedabad'),
        ('Jaipur', 'Jaipur'),
        ('Lucknow', 'Lucknow'),
        ('Other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('contacted', 'Contacted'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
    ]
    
    # Personal Information
    name = models.CharField(max_length=255)
    email = models.EmailField()
    whatsapp_number = models.CharField(max_length=20)
    location = models.CharField(max_length=100, choices=LOCATION_CHOICES)
    
    # Shoot Details
    shoot_type = models.CharField(max_length=100, choices=SHOOT_TYPE_CHOICES)
    event_details = models.TextField(
        help_text="Tell us more about your shoot - location, date, special requirements..."
    )
    
    # Budget & Timeline
    budget = models.CharField(max_length=50, choices=BUDGET_CHOICES)
    timeline = models.CharField(max_length=50, choices=TIMELINE_CHOICES)
    
    # References
    reference_video_link = models.URLField()
    
    # Status & Timestamps
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Admin Notes
    admin_notes = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Shoot Booking'
        verbose_name_plural = 'Shoot Bookings'
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['shoot_type']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.shoot_type} ({self.created_at.strftime('%Y-%m-%d')})"
