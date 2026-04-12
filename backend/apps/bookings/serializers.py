from rest_framework import serializers
from .models import ServiceBooking, ShootBooking, InnerCircleApplication, TechnicalSolutionBooking


class ServiceBookingSerializer(serializers.ModelSerializer):
    """Serializer for Service Booking model."""
    
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = ServiceBooking
        fields = [
            'id',
            'name',
            'email',
            'whatsapp_number',
            'location',
            'service_type',
            'project_title',
            'description',
            'content_type',
            'budget',
            'timeline',
            'reference_video_link',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']
    
    def validate_whatsapp_number(self, value):
        """Validate WhatsApp number format."""
        # Remove all non-digit characters
        digits_only = ''.join(filter(str.isdigit, value))
        
        # Check if it has at least 10 digits
        if len(digits_only) < 10:
            raise serializers.ValidationError(
                "WhatsApp number must have at least 10 digits."
            )
        
        return value


class ServiceBookingListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing bookings."""
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    service_display = serializers.CharField(source='get_service_type_display', read_only=True)
    
    class Meta:
        model = ServiceBooking
        fields = [
            'id',
            'name',
            'email',
            'service_type',
            'service_display',
            'project_title',
            'status',
            'status_display',
            'created_at',
        ]
        read_only_fields = fields


class ShootBookingSerializer(serializers.ModelSerializer):
    """Serializer for Shoot Booking model."""
    
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = ShootBooking
        fields = [
            'id',
            'name',
            'email',
            'whatsapp_number',
            'location',
            'shoot_type',
            'event_details',
            'budget',
            'timeline',
            'reference_video_link',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']
    
    def validate_whatsapp_number(self, value):
        """Validate WhatsApp number format."""
        # Remove all non-digit characters
        digits_only = ''.join(filter(str.isdigit, value))
        
        # Check if it has at least 10 digits
        if len(digits_only) < 10:
            raise serializers.ValidationError(
                "WhatsApp number must have at least 10 digits."
            )
        
        return value


class ShootBookingListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing shoot bookings."""
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    shoot_display = serializers.CharField(source='get_shoot_type_display', read_only=True)
    
    class Meta:
        model = ShootBooking
        fields = [
            'id',
            'name',
            'email',
            'shoot_type',
            'shoot_display',
            'status',
            'status_display',
            'created_at',
        ]
        read_only_fields = fields


class InnerCircleApplicationSerializer(serializers.ModelSerializer):
    """Serializer for Inner Circle Application model."""
    
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = InnerCircleApplication
        fields = [
            'id',
            'name',
            'age',
            'whatsapp_number',
            'gmail',
            'achievement',
            'top_skill',
            'portfolio_link',
            'state',
            'district',
            'location',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']
    
    def validate_age(self, value):
        """Validate age is within reasonable range."""
        if value < 18 or value > 100:
            raise serializers.ValidationError(
                "Age must be between 18 and 100."
            )
        return value
    
    def validate_whatsapp_number(self, value):
        """Validate WhatsApp number format."""
        # Remove all non-digit characters
        digits_only = ''.join(filter(str.isdigit, value))
        
        # Check if it has at least 10 digits
        if len(digits_only) < 10:
            raise serializers.ValidationError(
                "WhatsApp number must have at least 10 digits."
            )
        
        return value


class InnerCircleApplicationListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing Inner Circle applications."""
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = InnerCircleApplication
        fields = [
            'id',
            'name',
            'age',
            'top_skill',
            'state',
            'status',
            'status_display',
            'created_at',
        ]
        read_only_fields = fields


class TechnicalSolutionBookingSerializer(serializers.ModelSerializer):
    """Serializer for Technical Solution Booking model."""
    
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = TechnicalSolutionBooking
        fields = [
            'id',
            'name',
            'whatsapp_number',
            'location',
            'service_type',
            'description',
            'message',
            'status',
            'status_display',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'status', 'status_display', 'created_at', 'updated_at']
    
    def validate_whatsapp_number(self, value):
        """Validate WhatsApp number format."""
        # Remove all non-digit characters
        digits_only = ''.join(filter(str.isdigit, value))
        
        # Check if it has at least 10 digits
        if len(digits_only) < 10:
            raise serializers.ValidationError(
                "WhatsApp number must have at least 10 digits."
            )
        
        return value


class TechnicalSolutionBookingListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing technical solution bookings."""
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = TechnicalSolutionBooking
        fields = [
            'id',
            'name',
            'whatsapp_number',
            'service_type',
            'status',
            'status_display',
            'created_at',
        ]
