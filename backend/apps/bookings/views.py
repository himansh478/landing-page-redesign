from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from .models import ServiceBooking, ShootBooking, InnerCircleApplication, TechnicalSolutionBooking
from .serializers import (
    ServiceBookingSerializer, 
    ServiceBookingListSerializer,
    ShootBookingSerializer,
    ShootBookingListSerializer,
    InnerCircleApplicationSerializer,
    InnerCircleApplicationListSerializer,
    TechnicalSolutionBookingSerializer,
    TechnicalSolutionBookingListSerializer
)


class ServiceBookingViewSet(viewsets.ModelViewSet):
    queryset = ServiceBooking.objects.all()
    serializer_class = ServiceBookingSerializer
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ServiceBookingListSerializer
        return ServiceBookingSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        elif self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [AllowAny()]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {
                'message': 'Service booking received successfully! We will contact you soon.',
                'booking_id': serializer.data.get('id'),
                'data': serializer.data
            },
            status=status.HTTP_201_CREATED
        )
    
    # Cache statistics 15 min — database baar baar hit nahi hoga
    @method_decorator(cache_page(60 * 15))
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def statistics(self, request):
        total_bookings = ServiceBooking.objects.count()
        pending_bookings = ServiceBooking.objects.filter(status='pending').count()
        completed_bookings = ServiceBooking.objects.filter(status='completed').count()
        service_counts = {}
        for booking in ServiceBooking.objects.values('service_type').distinct():
            service = booking['service_type']
            service_counts[service] = ServiceBooking.objects.filter(
                service_type=service
            ).count()
        return Response({
            'total_bookings': total_bookings,
            'pending_bookings': pending_bookings,
            'completed_bookings': completed_bookings,
            'service_counts': service_counts,
        })
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_status(self, request, pk=None):
        booking = self.get_object()
        new_status = request.data.get('status')
        valid_statuses = [choice[0] for choice in ServiceBooking.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Must be one of: {valid_statuses}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        booking.status = new_status
        booking.admin_notes = request.data.get('admin_notes', booking.admin_notes)
        booking.save()
        serializer = self.get_serializer(booking)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def bulk_update_status(self, request):
        booking_ids = request.data.get('booking_ids', [])
        new_status = request.data.get('status')
        if not booking_ids or not new_status:
            return Response(
                {'error': 'booking_ids list and status are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        bookings = ServiceBooking.objects.filter(id__in=booking_ids)
        updated_count = bookings.update(status=new_status)
        return Response({
            'message': f'Updated {updated_count} bookings',
            'updated_count': updated_count
        })


class ShootBookingViewSet(viewsets.ModelViewSet):
    queryset = ShootBooking.objects.all()
    serializer_class = ShootBookingSerializer
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ShootBookingListSerializer
        return ShootBookingSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        elif self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [AllowAny()]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {
                'message': 'Shoot booking received successfully! We will contact you soon to confirm details.',
                'booking_id': serializer.data.get('id'),
                'data': serializer.data
            },
            status=status.HTTP_201_CREATED
        )
    
    # Cache statistics 15 min
    @method_decorator(cache_page(60 * 15))
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def statistics(self, request):
        total_bookings = ShootBooking.objects.count()
        pending_bookings = ShootBooking.objects.filter(status='pending').count()
        completed_bookings = ShootBooking.objects.filter(status='completed').count()
        return Response({
            'total_bookings': total_bookings,
            'pending_bookings': pending_bookings,
            'completed_bookings': completed_bookings,
        })
    
    @action(detail=False, methods=['get'], url_path=r'by-status/(?P<status>\w+)')
    def by_status(self, request, status=None):
        bookings = ShootBooking.objects.filter(status=status)
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def bulk_update_status(self, request):
        booking_ids = request.data.get('booking_ids', [])
        new_status = request.data.get('status')
        if not booking_ids or not new_status:
            return Response(
                {'error': 'booking_ids list and status are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        bookings = ShootBooking.objects.filter(id__in=booking_ids)
        updated_count = bookings.update(status=new_status)
        return Response({
            'message': f'Updated {updated_count} shoot bookings',
            'updated_count': updated_count
        })


class InnerCircleApplicationViewSet(viewsets.ModelViewSet):
    queryset = InnerCircleApplication.objects.all()
    serializer_class = InnerCircleApplicationSerializer
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return InnerCircleApplicationListSerializer
        return InnerCircleApplicationSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        elif self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [AllowAny()]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {
                'message': 'Application submitted successfully! We will review your profile and contact you soon.',
                'application_id': serializer.data.get('id'),
                'data': serializer.data
            },
            status=status.HTTP_201_CREATED
        )
    
    # Cache statistics 15 min
    @method_decorator(cache_page(60 * 15))
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def statistics(self, request):
        total_applications = InnerCircleApplication.objects.count()
        pending_applications = InnerCircleApplication.objects.filter(status='pending').count()
        approved_applications = InnerCircleApplication.objects.filter(status='approved').count()
        location_counts = {}
        for app in InnerCircleApplication.objects.values('state').distinct():
            state = app['state']
            location_counts[state] = InnerCircleApplication.objects.filter(
                state=state
            ).count()
        return Response({
            'total_applications': total_applications,
            'pending_applications': pending_applications,
            'approved_applications': approved_applications,
            'location_counts': location_counts,
        })
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_status(self, request, pk=None):
        application = self.get_object()
        new_status = request.data.get('status')
        valid_statuses = [choice[0] for choice in InnerCircleApplication.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Must be one of: {valid_statuses}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        application.status = new_status
        application.admin_notes = request.data.get('admin_notes', application.admin_notes)
        application.save()
        serializer = self.get_serializer(application)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def by_status(self, request):
        status_filter = request.query_params.get('status')
        if not status_filter:
            return Response(
                {'error': 'status parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        applications = InnerCircleApplication.objects.filter(status=status_filter)
        serializer = self.get_serializer(applications, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def bulk_update_status(self, request):
        application_ids = request.data.get('application_ids', [])
        new_status = request.data.get('status')
        if not application_ids or not new_status:
            return Response(
                {'error': 'application_ids list and status are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        applications = InnerCircleApplication.objects.filter(id__in=application_ids)
        updated_count = applications.update(status=new_status)
        return Response({
            'message': f'Updated {updated_count} applications',
            'updated_count': updated_count
        })


class TechnicalSolutionBookingViewSet(viewsets.ModelViewSet):
    queryset = TechnicalSolutionBooking.objects.all()
    serializer_class = TechnicalSolutionBookingSerializer
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return TechnicalSolutionBookingListSerializer
        return TechnicalSolutionBookingSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        elif self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [AllowAny()]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {
                'message': 'Technical solution booking received successfully! We will contact you soon.',
                'booking_id': serializer.data.get('id'),
                'data': serializer.data
            },
            status=status.HTTP_201_CREATED
        )
    
    # Cache statistics 15 min
    @method_decorator(cache_page(60 * 15))
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def statistics(self, request):
        total_bookings = TechnicalSolutionBooking.objects.count()
        pending_bookings = TechnicalSolutionBooking.objects.filter(status='pending').count()
        completed_bookings = TechnicalSolutionBooking.objects.filter(status='completed').count()
        service_counts = {}
        for booking in TechnicalSolutionBooking.objects.values('service_type').distinct():
            service = booking['service_type']
            service_counts[service] = TechnicalSolutionBooking.objects.filter(
                service_type=service
            ).count()
        return Response({
            'total_bookings': total_bookings,
            'pending_bookings': pending_bookings,
            'completed_bookings': completed_bookings,
            'service_counts': service_counts,
        })
# from rest_framework import viewsets, status
# from rest_framework.response import Response
# from rest_framework.decorators import action
# from rest_framework.permissions import AllowAny, IsAuthenticated
# from .models import ServiceBooking, ShootBooking, InnerCircleApplication, TechnicalSolutionBooking
# from .serializers import (
#     ServiceBookingSerializer, 
#     ServiceBookingListSerializer,
#     ShootBookingSerializer,
#     ShootBookingListSerializer,
#     InnerCircleApplicationSerializer,
#     InnerCircleApplicationListSerializer,
#     TechnicalSolutionBookingSerializer,
#     TechnicalSolutionBookingListSerializer
# )


# class ServiceBookingViewSet(viewsets.ModelViewSet):
#     """ViewSet for managing Service Bookings."""
    
#     queryset = ServiceBooking.objects.all()
#     serializer_class = ServiceBookingSerializer
#     permission_classes = [AllowAny]
    
#     def get_serializer_class(self):
#         """Use different serializers for different actions."""
#         if self.action == 'list':
#             return ServiceBookingListSerializer
#         return ServiceBookingSerializer
    
#     def get_permissions(self):
#         """Allow anyone to create, but only staff to view all."""
#         if self.action == 'create':
#             return [AllowAny()]
#         elif self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
#             return [IsAuthenticated()]
#         return [AllowAny()]
    
#     def create(self, request, *args, **kwargs):
#         """Handle creation of service booking with custom response."""
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         self.perform_create(serializer)
        
#         return Response(
#             {
#                 'message': 'Service booking received successfully! We will contact you soon.',
#                 'booking_id': serializer.data.get('id'),
#                 'data': serializer.data
#             },
#             status=status.HTTP_201_CREATED
#         )
    
#     @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
#     def statistics(self, request):
#         """Get booking statistics."""
#         total_bookings = ServiceBooking.objects.count()
#         pending_bookings = ServiceBooking.objects.filter(status='pending').count()
#         completed_bookings = ServiceBooking.objects.filter(status='completed').count()
        
#         # Count by service type
#         service_counts = {}
#         for booking in ServiceBooking.objects.values('service_type').distinct():
#             service = booking['service_type']
#             service_counts[service] = ServiceBooking.objects.filter(
#                 service_type=service
#             ).count()
        
#         return Response({
#             'total_bookings': total_bookings,
#             'pending_bookings': pending_bookings,
#             'completed_bookings': completed_bookings,
#             'service_counts': service_counts,
#         })
    
#     @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
#     def update_status(self, request, pk=None):
#         """Update booking status."""
#         booking = self.get_object()
#         new_status = request.data.get('status')
        
#         valid_statuses = [choice[0] for choice in ServiceBooking.STATUS_CHOICES]
#         if new_status not in valid_statuses:
#             return Response(
#                 {'error': f'Invalid status. Must be one of: {valid_statuses}'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         booking.status = new_status
#         booking.admin_notes = request.data.get('admin_notes', booking.admin_notes)
#         booking.save()
        
#         serializer = self.get_serializer(booking)
#         return Response(serializer.data)
    
#     @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
#     def bulk_update_status(self, request):
#         """Bulk update status for multiple bookings."""
#         booking_ids = request.data.get('booking_ids', [])
#         new_status = request.data.get('status')
        
#         if not booking_ids or not new_status:
#             return Response(
#                 {'error': 'booking_ids list and status are required'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         bookings = ServiceBooking.objects.filter(id__in=booking_ids)
#         updated_count = bookings.update(status=new_status)
        
#         return Response({
#             'message': f'Updated {updated_count} bookings',
#             'updated_count': updated_count
#         })


# class ShootBookingViewSet(viewsets.ModelViewSet):
#     """ViewSet for managing Shoot Bookings - SEPARATE from editing services."""
    
#     queryset = ShootBooking.objects.all()
#     serializer_class = ShootBookingSerializer
#     permission_classes = [AllowAny]
    
#     def get_serializer_class(self):
#         """Use different serializers for different actions."""
#         if self.action == 'list':
#             return ShootBookingListSerializer
#         return ShootBookingSerializer
    
#     def get_permissions(self):
#         """Allow anyone to create, but only staff to view all."""
#         if self.action == 'create':
#             return [AllowAny()]
#         elif self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
#             return [IsAuthenticated()]
#         return [AllowAny()]
    
#     def create(self, request, *args, **kwargs):
#         """Handle creation of shoot booking with custom response."""
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         self.perform_create(serializer)
        
#         return Response(
#             {
#                 'message': 'Shoot booking received successfully! We will contact you soon to confirm details.',
#                 'booking_id': serializer.data.get('id'),
#                 'data': serializer.data
#             },
#             status=status.HTTP_201_CREATED
#         )
    
#     @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
#     def statistics(self, request):
#         """Get shoot booking statistics."""
#         total_bookings = ShootBooking.objects.count()
#         pending_bookings = ShootBooking.objects.filter(status='pending').count()
#         completed_bookings = ShootBooking.objects.filter(status='completed').count()
        
#         return Response({
#             'total_bookings': total_bookings,
#             'pending_bookings': pending_bookings,
#             'completed_bookings': completed_bookings,
#         })
    
#     @action(detail=False, methods=['get'], url_path=r'by-status/(?P<status>\w+)')
#     def by_status(self, request, status=None):
#         """Filter bookings by status."""
#         bookings = ShootBooking.objects.filter(status=status)
#         serializer = self.get_serializer(bookings, many=True)
#         return Response(serializer.data)
    
#     @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
#     def bulk_update_status(self, request):
#         """Bulk update status of multiple shoot bookings."""
#         booking_ids = request.data.get('booking_ids', [])
#         new_status = request.data.get('status')
        
#         if not booking_ids or not new_status:
#             return Response(
#                 {'error': 'booking_ids list and status are required'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         bookings = ShootBooking.objects.filter(id__in=booking_ids)
#         updated_count = bookings.update(status=new_status)
        
#         return Response({
#             'message': f'Updated {updated_count} shoot bookings',
#             'updated_count': updated_count
#         })


# class InnerCircleApplicationViewSet(viewsets.ModelViewSet):
#     """ViewSet for managing Inner Circle Applications."""
    
#     queryset = InnerCircleApplication.objects.all()
#     serializer_class = InnerCircleApplicationSerializer
#     permission_classes = [AllowAny]
    
#     def get_serializer_class(self):
#         """Use different serializers for different actions."""
#         if self.action == 'list':
#             return InnerCircleApplicationListSerializer
#         return InnerCircleApplicationSerializer
    
#     def get_permissions(self):
#         """Allow anyone to create, but only staff to view all."""
#         if self.action == 'create':
#             return [AllowAny()]
#         elif self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
#             return [IsAuthenticated()]
#         return [AllowAny()]
    
#     def create(self, request, *args, **kwargs):
#         """Handle creation of Inner Circle application with custom response."""
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         self.perform_create(serializer)
        
#         return Response(
#             {
#                 'message': 'Application submitted successfully! We will review your profile and contact you soon.',
#                 'application_id': serializer.data.get('id'),
#                 'data': serializer.data
#             },
#             status=status.HTTP_201_CREATED
#         )
    
#     @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
#     def statistics(self, request):
#         """Get application statistics."""
#         total_applications = InnerCircleApplication.objects.count()
#         pending_applications = InnerCircleApplication.objects.filter(status='pending').count()
#         approved_applications = InnerCircleApplication.objects.filter(status='approved').count()
        
#         # Count by location
#         location_counts = {}
#         for app in InnerCircleApplication.objects.values('state').distinct():
#             state = app['state']
#             location_counts[state] = InnerCircleApplication.objects.filter(
#                 state=state
#             ).count()
        
#         return Response({
#             'total_applications': total_applications,
#             'pending_applications': pending_applications,
#             'approved_applications': approved_applications,
#             'location_counts': location_counts,
#         })
    
#     @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
#     def update_status(self, request, pk=None):
#         """Update application status."""
#         application = self.get_object()
#         new_status = request.data.get('status')
        
#         valid_statuses = [choice[0] for choice in InnerCircleApplication.STATUS_CHOICES]
#         if new_status not in valid_statuses:
#             return Response(
#                 {'error': f'Invalid status. Must be one of: {valid_statuses}'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         application.status = new_status
#         application.admin_notes = request.data.get('admin_notes', application.admin_notes)
#         application.save()
        
#         serializer = self.get_serializer(application)
#         return Response(serializer.data)
    
#     @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
#     def by_status(self, request):
#         """Filter applications by status."""
#         status_filter = request.query_params.get('status')
#         if not status_filter:
#             return Response(
#                 {'error': 'status parameter is required'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         applications = InnerCircleApplication.objects.filter(status=status_filter)
#         serializer = self.get_serializer(applications, many=True)
#         return Response(serializer.data)
    
#     @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
#     def bulk_update_status(self, request):
#         """Bulk update status for multiple applications."""
#         application_ids = request.data.get('application_ids', [])
#         new_status = request.data.get('status')
        
#         if not application_ids or not new_status:
#             return Response(
#                 {'error': 'application_ids list and status are required'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         applications = InnerCircleApplication.objects.filter(id__in=application_ids)
#         updated_count = applications.update(status=new_status)
        
#         return Response({
#             'message': f'Updated {updated_count} applications',
#             'updated_count': updated_count
#         })


# class TechnicalSolutionBookingViewSet(viewsets.ModelViewSet):
#     """ViewSet for managing Technical Solution Bookings."""
    
#     queryset = TechnicalSolutionBooking.objects.all()
#     serializer_class = TechnicalSolutionBookingSerializer
#     permission_classes = [AllowAny]
    
#     def get_serializer_class(self):
#         """Use different serializers for different actions."""
#         if self.action == 'list':
#             return TechnicalSolutionBookingListSerializer
#         return TechnicalSolutionBookingSerializer
    
#     def get_permissions(self):
#         """Allow anyone to create, but only authenticated users to view all."""
#         if self.action == 'create':
#             return [AllowAny()]
#         elif self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
#             return [IsAuthenticated()]
#         return [AllowAny()]
    
#     def create(self, request, *args, **kwargs):
#         """Handle creation of technical solution booking with custom response."""
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         self.perform_create(serializer)
        
#         return Response(
#             {
#                 'message': 'Technical solution booking received successfully! We will contact you soon.',
#                 'booking_id': serializer.data.get('id'),
#                 'data': serializer.data
#             },
#             status=status.HTTP_201_CREATED
#         )
    
#     @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
#     def statistics(self, request):
#         """Get technical solution booking statistics."""
#         total_bookings = TechnicalSolutionBooking.objects.count()
#         pending_bookings = TechnicalSolutionBooking.objects.filter(status='pending').count()
#         completed_bookings = TechnicalSolutionBooking.objects.filter(status='completed').count()
        
#         # Count by service type
#         service_counts = {}
#         for booking in TechnicalSolutionBooking.objects.values('service_type').distinct():
#             service = booking['service_type']
#             service_counts[service] = TechnicalSolutionBooking.objects.filter(
#                 service_type=service
#             ).count()
        
#         return Response({
#             'total_bookings': total_bookings,
#             'pending_bookings': pending_bookings,
#             'completed_bookings': completed_bookings,
#             'service_counts': service_counts,
#         })
