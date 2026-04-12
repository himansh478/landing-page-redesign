from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceBookingViewSet, ShootBookingViewSet, InnerCircleApplicationViewSet, TechnicalSolutionBookingViewSet

router = DefaultRouter()
router.register(r'bookings', ServiceBookingViewSet)
router.register(r'shoot-bookings', ShootBookingViewSet)
router.register(r'inner-circle-applications', InnerCircleApplicationViewSet)
router.register(r'technical-solution-bookings', TechnicalSolutionBookingViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
