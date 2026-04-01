from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, LoyaltyTransactionViewSet

router = DefaultRouter()
router.register(r'loyalty', LoyaltyTransactionViewSet)
router.register(r'', CustomerViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
