from django.contrib import admin
from .models import Order, OrderItem
from django.contrib.auth import get_user_model


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "total_price", "created_at", "is_paid")


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "product", "quantity", "price")
