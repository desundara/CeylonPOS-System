from rest_framework import serializers
from .models import Category, Product

class CategorySlugField(serializers.SlugRelatedField):
    def to_internal_value(self, data):
        try:
            obj, created = self.get_queryset().get_or_create(**{self.slug_field: data})
            return obj
        except (TypeError, ValueError):
            self.fail('invalid')

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySlugField(
        queryset=Category.objects.all(),
        slug_field='name'
    )
    category_name = serializers.ReadOnlyField(source='category.name')
    image = serializers.SerializerMethodField()
    image_file = serializers.FileField(source='image', required=False, allow_null=True, write_only=True)
    remove_image = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = Product
        fields = '__all__'

    def get_image(self, obj):
        if not obj.image:
            return None

        request = self.context.get('request')
        url = obj.image.url
        return request.build_absolute_uri(url) if request else url

    def create(self, validated_data):
        validated_data.pop('remove_image', False)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        remove_image = validated_data.pop('remove_image', False)
        if remove_image:
            if instance.image:
                instance.image.delete(save=False)
            instance.image = None
        return super().update(instance, validated_data)
