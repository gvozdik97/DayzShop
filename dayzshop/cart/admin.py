from django.contrib import admin
from .models import Cart, CartItem, Order, OrderItem

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ('total_price',)
    fields = ('product', 'quantity', 'price', 'total_price')
    raw_id_fields = ('product',)

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'session_key', 'created_at', 'items_count', 'get_total_price')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'session_key')
    readonly_fields = ('created_at', 'items_count', 'get_total_price')
    inlines = (CartItemInline,)
    
    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('items')

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('total_price',)
    fields = ('product', 'quantity', 'price', 'total_price')
    raw_id_fields = ('product',)
    
    def total_price(self, obj):
        return obj.price * obj.quantity
    total_price.short_description = 'Сумма'

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'steam_id', 'created_at', 'total_price', 'is_paid')
    list_filter = ('is_paid', 'created_at')
    search_fields = ('user__username', 'steam_id')
    readonly_fields = ('created_at', 'get_order_items')
    inlines = (OrderItemInline,)
    actions = ['mark_as_paid']
    
    def get_order_items(self, obj):
        return "\n".join([str(item) for item in obj.get_items()])
    get_order_items.short_description = 'Товары в заказе'
    
    def mark_as_paid(self, request, queryset):
        queryset.update(is_paid=True)
    mark_as_paid.short_description = 'Пометить как оплаченные'

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product', 'quantity', 'price', 'total_price')
    list_filter = ('order__is_paid',)
    search_fields = ('product__name', 'order__id')
    raw_id_fields = ('order', 'product')
    
    def total_price(self, obj):
        return obj.price * obj.quantity
    total_price.short_description = 'Сумма'