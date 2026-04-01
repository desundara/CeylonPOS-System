from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import AppSettings
from .serializers import AppSettingsSerializer


class AppSettingsView(APIView):
    def get_object(self):
        settings_obj, _ = AppSettings.objects.get_or_create(pk=1)
        return settings_obj

    def get(self, request):
        serializer = AppSettingsSerializer(self.get_object())
        return Response(serializer.data)

    def put(self, request):
        settings_obj = self.get_object()
        serializer = AppSettingsSerializer(settings_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

