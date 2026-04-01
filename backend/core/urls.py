from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/products/', include('products.urls')),
    path('api/settings/', include('app_settings.urls')),
    path('api/customers/', include('customers.urls')),
    path('api/sales/', include('sales.urls')),
    path('api/users/', include('users.urls')),
    path('api/suppliers/', include('suppliers.urls')),
    path('api/cashiers/', include('cashiers.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
