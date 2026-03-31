from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CashierViewSet

router = DefaultRouter()
router.register(r'', CashierViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
