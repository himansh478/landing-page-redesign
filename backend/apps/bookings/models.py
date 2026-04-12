from django.db import models
from django.core.validators import URLValidator
from django.utils import timezone


class ServiceBooking(models.Model):
    """Model to store service booking requests."""
    
    SERVICE_CHOICES = [
        ('Vlog Edit', 'Vlog Edit'),
        ('Documentary Edit', 'Documentary Edit'),
        ('Reel Edit', 'Reel Edit'),
        ('AI Edit', 'AI Edit'),
        ('Custom Edit', 'Custom Edit'),
        ('Wedding Edit', 'Wedding Edit'),
        ('Professional Shoot', 'Professional Shoot'),
    ]
    
    DURATION_CHOICES = [
        ('Under 1 minute', 'Under 1 minute'),
        ('1-5 minutes', '1-5 minutes'),
        ('5-15 minutes', '5-15 minutes'),
        ('15-30 minutes', '15-30 minutes'),
        ('30+ minutes', '30+ minutes'),
    ]
    
    CONTENT_TYPE_CHOICES = [
        ('YouTube Video', 'YouTube Video'),
        ('Instagram Reel', 'Instagram Reel'),
        ('TikTok', 'TikTok'),
        ('Documentary', 'Documentary'),
        ('Wedding', 'Wedding'),
        ('Corporate', 'Corporate'),
        ('Other', 'Other'),
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
    location = models.CharField(max_length=100)
    
    # Project Details
    service_type = models.CharField(max_length=50, choices=SERVICE_CHOICES)
    project_title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    
    # Content Information
    content_type = models.CharField(max_length=50, choices=CONTENT_TYPE_CHOICES, blank=True)
    
    # Budget & Timeline
    budget = models.CharField(max_length=100)
    timeline = models.CharField(max_length=100)
    
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
        verbose_name = 'Service Booking'
        verbose_name_plural = 'Service Bookings'
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['service_type']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.service_type} ({self.created_at.strftime('%Y-%m-%d')})"


class ShootBooking(models.Model):
    """Model to store professional shoot booking requests - SEPARATE from editing services."""
    
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
    location = models.CharField(max_length=100)
    
    # Shoot Details
    shoot_type = models.CharField(max_length=100, choices=SHOOT_TYPE_CHOICES)
    event_details = models.TextField(
        help_text="Tell us more about your shoot - location, date, special requirements...",
        blank=True, default=''
    )
    
    # Budget & Timeline
    budget = models.CharField(max_length=100)
    timeline = models.CharField(max_length=100)
    
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


class InnerCircleApplication(models.Model):
    """Model to store Inner Circle membership applications."""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('contacted', 'Contacted'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    # Personal Information
    name = models.CharField(max_length=255)
    age = models.IntegerField()
    whatsapp_number = models.CharField(max_length=20)
    gmail = models.EmailField()
    
    # Professional Information
    achievement = models.TextField(
        help_text="Tell us about your greatest achievement"
    )
    top_skill = models.CharField(
        max_length=255,
        help_text="e.g., Digital Marketing, Video Editing, Business Strategy"
    )
    portfolio_link = models.URLField()
    
    # Location Information
    state = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    
    # Status & Timestamps
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Admin Notes
    admin_notes = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Inner Circle Application'
        verbose_name_plural = 'Inner Circle Applications'
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['state']),
        ]
    
    def __str__(self):
        return f"{self.name} - Inner Circle ({self.created_at.strftime('%Y-%m-%d')})"

class TechnicalSolutionBooking(models.Model):
    """Model to store Technical Solution booking requests."""
    
    SERVICE_CHOICES = [
        ('Website Design', 'Website Design'),
        ('Automation', 'Automation'),
        ('AI Bot', 'AI Bot'),
        ('Insta Auto Reply', 'Insta Auto Reply'),
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
    whatsapp_number = models.CharField(max_length=20)
    location = models.CharField(max_length=100)
    
    # Project Details
    service_type = models.CharField(max_length=100, choices=SERVICE_CHOICES)
    description = models.TextField()
    message = models.TextField(blank=True, null=True)
    
    # Status & Timestamps
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Technical Solution Booking'
        verbose_name_plural = 'Technical Solution Bookings'
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.service_type} ({self.created_at.strftime('%Y-%m-%d')})"