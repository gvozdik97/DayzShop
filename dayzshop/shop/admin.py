from django.contrib import admin
from .models import Category, Product
# from django.utils import timezone


# current_time = timezone.now()


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    list_display_links = ('name',)
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'old_price', 'is_on_sale', 'discount_percentage', 'available', 'created', 'updated')
    list_filter = ('available', 'category', 'created', 'updated')
    list_editable = ('price', 'old_price', 'is_on_sale', 'available')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    raw_id_fields = ('category',)
    date_hierarchy = 'created'
    ordering = ('-created',)
    fieldsets = (
        (None, {
            'fields': ('category', 'name', 'slug', 'description')
        }),
        ('Цена и доступность', {
            'fields': ('price', 'old_price', 'is_on_sale', 'available')
        }),
        ('Изображение', {
            'fields': ('image',)
        }),
    )

