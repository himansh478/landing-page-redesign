from django.contrib import admin
from django.utils.html import format_html
from .models import ServiceBooking, ShootBooking, InnerCircleApplication, TechnicalSolutionBooking


@admin.register(ShootBooking)
class ShootBookingAdmin(admin.ModelAdmin):
    """Admin interface for Shoot Bookings."""
    
    list_display = [
        'name',
        'shoot_type',
        'email',
        'whatsapp_number',
        'budget',
        'location',
        'timeline',
        'status_badge',
        'created_at',
    ]
    
    list_filter = ['status', 'shoot_type', 'budget', 'timeline', 'location', 'created_at']
    search_fields = ['name', 'email', 'whatsapp_number', 'location']
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('name', 'email', 'whatsapp_number', 'location')
        }),
        ('Shoot Details', {
            'fields': ('shoot_type', 'event_details')
        }),
        ('Budget & Timeline', {
            'fields': ('budget', 'timeline')
        }),
        ('References', {
            'fields': ('reference_video_link',)
        }),
        ('Status & Notes', {
            'fields': ('status', 'admin_notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def status_badge(self, obj):
        colors = {
            'pending': '#FFA500',
            'contacted': '#87CEEB',
            'in_progress': '#90EE90',
            'completed': '#32CD32',
            'rejected': '#FF6347',
        }
        color = colors.get(obj.status, '#808080')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 5px 10px; '
            'border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    
    status_badge.short_description = 'Status'


@admin.register(ServiceBooking)
class ServiceBookingAdmin(admin.ModelAdmin):
    """Admin interface for Service Bookings."""
    
    list_display = [
        'name',
        'service_type',
        'email',
        'budget',
        'whatsapp_number',
        'status_badge',
        'location',
        'created_at',
    ]
    
    list_filter = ['status', 'service_type', 'content_type', 'budget', 'created_at', 'location']
    search_fields = ['name', 'email', 'whatsapp_number', 'project_title', 'location']
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('name', 'email', 'whatsapp_number', 'location')
        }),
        ('Project Details', {
            'fields': ('service_type', 'project_title', 'description')
        }),
        ('Content Information', {
            'fields': ('content_type',)
        }),
        ('Budget & Timeline', {
            'fields': ('budget', 'timeline')
        }),
        ('References', {
            'fields': ('reference_video_link',)
        }),
        ('Status & Notes', {
            'fields': ('status',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def status_badge(self, obj):
        colors = {
            'pending': '#FFA500',
            'contacted': '#87CEEB',
            'in_progress': '#90EE90',
            'completed': '#32CD32',
            'rejected': '#FF6347',
        }
        color = colors.get(obj.status, '#808080')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 5px 10px; '
            'border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    
    status_badge.short_description = 'Status'


@admin.register(InnerCircleApplication)
class InnerCircleApplicationAdmin(admin.ModelAdmin):
    """Admin interface for Inner Circle Applications."""
    
    list_display = [
        'name',
        'age',
        'top_skill',
        'state',
        'status_badge',
        'created_at',
    ]
    
    list_filter = ['status', 'state', 'created_at']
    search_fields = ['name', 'top_skill', 'state']
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('name', 'age', 'whatsapp_number', 'gmail')
        }),
        ('Professional Information', {
            'fields': ('achievement', 'top_skill', 'portfolio_link')
        }),
        ('Location Information', {
            'fields': ('state', 'district', 'location')
        }),
        ('Status & Notes', {
            'fields': ('status', 'admin_notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def status_badge(self, obj):
        colors = {
            'pending': '#FFA500',
            'contacted': '#87CEEB',
            'approved': '#32CD32',
            'rejected': '#FF6347',
        }
        color = colors.get(obj.status, '#808080')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 5px 10px; '
            'border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    
    status_badge.short_description = 'Status'


@admin.register(TechnicalSolutionBooking)
class TechnicalSolutionBookingAdmin(admin.ModelAdmin):
    """Admin interface for Technical Solution Bookings."""
    
    list_display = [
        'name',
        'service_type',
        'whatsapp_number',
        'status_badge',
        'location',
        'created_at',
    ]
    
    list_filter = ['status', 'service_type', 'created_at', 'location']
    search_fields = ['name', 'whatsapp_number', 'service_type', 'location']
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('name', 'whatsapp_number', 'location')
        }),
        ('Project Details', {
            'fields': ('service_type', 'description', 'message')
        }),
        ('Status & Notes', {
            'fields': ('status',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def status_badge(self, obj):
        colors = {
            'pending': '#FFA500',
            'contacted': '#87CEEB',
            'in_progress': '#1E90FF',
            'completed': '#32CD32',
            'rejected': '#FF6347',
        }
        color = colors.get(obj.status, '#808080')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 5px 10px; '
            'border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    
    status_badge.short_description = 'Status'
