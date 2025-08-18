from django.contrib import admin
from .models import Cart, CartItem, Order, OrderItem
from django.utils.html import format_html

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ('product', 'quantity', 'price', 'total_price_display')
    fields = ('product', 'quantity', 'price', 'total_price_display')
    raw_id_fields = ('product',)

    def total_price_display(self, obj):
        return f"{obj.total_price} ₽"
    total_price_display.short_description = 'Сумма'

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_or_session', 'created_at', 'items_count', 'total_price_display')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'session_key')
    readonly_fields = ('created_at', 'items_count_display', 'total_price_display')
    inlines = (CartItemInline,)

    def user_or_session(self, obj):
        return obj.user.username if obj.user else f"Аноним ({obj.session_key[:10]}...)"
    user_or_session.short_description = 'Пользователь'

    def items_count_display(self, obj):
        return obj.items_count
    items_count_display.short_description = 'Кол-во товаров'

    def total_price_display(self, obj):
        return f"{obj.get_total_price} ₽"
    total_price_display.short_description = 'Общая сумма'

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'quantity', 'price', 'total_price_display')
    fields = ('product', 'quantity', 'price', 'total_price_display')
    raw_id_fields = ('product',)

    def total_price_display(self, obj):
        return f"{obj.price * obj.quantity} ₽"
    total_price_display.short_description = 'Сумма'

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'created_at', 'total_price_display', 'is_paid', 'steam_id')
    list_filter = ('is_paid', 'created_at')
    search_fields = ('user__username', 'steam_id')
    readonly_fields = ('created_at', 'total_price_display')
    inlines = (OrderItemInline,)
    actions = ['mark_as_paid']

    def total_price_display(self, obj):
        return f"{obj.total_price} ₽"
    total_price_display.short_description = 'Сумма заказа'

    def mark_as_paid(self, request, queryset):
        queryset.update(is_paid=True)
    mark_as_paid.short_description = 'Пометить как оплаченные'

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order_link', 'product_link', 'quantity', 'price_display', 'total_price_display')
    list_filter = ('order__is_paid',)
    search_fields = ('product__name', 'order__id')
    raw_id_fields = ('order', 'product')

    def order_link(self, obj):
        return format_html('<a href="{}">{}</a>', 
                         f'/admin/cart/order/{obj.order.id}/change/',
                         f"Заказ #{obj.order.id}")
    order_link.short_description = 'Заказ'

    def product_link(self, obj):
        return format_html('<a href="{}">{}</a>', 
                         f'/admin/shop/product/{obj.product.id}/change/',
                         obj.product.name)
    product_link.short_description = 'Товар'

    def price_display(self, obj):
        return f"{obj.price} ₽"
    price_display.short_description = 'Цена'

    def total_price_display(self, obj):
        return f"{obj.price * obj.quantity} ₽"
    total_price_display.short_description = 'Сумма'