from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SaleViewSet, DailyMetricViewSet, MonthlyMetricViewSet, TopProductMetricViewSet, PaymentSummaryViewSet

router = DefaultRouter()
router.register(r'daily-metrics', DailyMetricViewSet, basename='daily-metrics')
router.register(r'monthly-metrics', MonthlyMetricViewSet, basename='monthly-metrics')
router.register(r'top-products', TopProductMetricViewSet, basename='top-products')
router.register(r'payment-summary', PaymentSummaryViewSet, basename='payment-summary')
router.register(r'', SaleViewSet, basename='sales')

urlpatterns = [
    path('', include(router.urls)),
]
