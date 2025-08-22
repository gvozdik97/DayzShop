from django.db import models
from django.db.models import Sum
from django.conf import settings
from decimal import Decimal


User = settings.AUTH_USER_MODEL


class Cart(models.Model):
    session_key = models.CharField(max_length=40, null=True, blank=True, db_index=True)
    user = models.OneToOneField(User, null=True, blank=True, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0'))

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["session_key"],
                name="unique_session_key",
                condition=models.Q(session_key__isnull=False),
            ),
            models.UniqueConstraint(
                fields=["user"],
                name="unique_user_cart",
                condition=models.Q(user__isnull=False),
            ),
        ]

    @property
    def items_count(self):
        return self.items.aggregate(total=Sum("quantity"))["total"] or 0

    @property
    def get_total_price(self):
        """Общая сумма БЕЗ учета скидок (по старым ценам)"""
        return sum(
            item.product.old_price * item.quantity 
            if item.product.is_on_sale and item.product.old_price 
            else item.product.price * item.quantity 
            for item in self.items.all()
        )

    @property
    def get_total_price_selected(self):
        """Общая сумма БЕЗ учета скидок только для выбранных товаров"""
        selected_items = self.items.filter(is_selected=True)
        return sum(
            item.product.old_price * item.quantity 
            if item.product.is_on_sale and item.product.old_price 
            else item.product.price * item.quantity 
            for item in selected_items
        )

    @property
    def get_total_price_after_discount(self):
        """Фактическая сумма к оплате (с учетом скидок) только для выбранных товаров"""
        selected_items = self.items.filter(is_selected=True)
        return sum(
            item.product.price * item.quantity
            for item in selected_items
        )

    @property
    def total_savings(self):
        """Сумма сэкономленных денег"""
        savings = Decimal('0')
        for item in self.items.all():
            if item.product.is_on_sale and item.product.old_price:
                savings += (item.product.old_price - item.product.price) * item.quantity
        return savings
    
    @property
    def total_savings_selected(self):
        """Сумма сэкономленных денег только для выбранных товаров"""
        savings = Decimal('0')
        selected_items = self.items.filter(is_selected=True)
        for item in selected_items:
            if item.product.is_on_sale and item.product.old_price:
                savings += (item.product.old_price - item.product.price) * item.quantity
        return savings

    def __str__(self):
        return f"Cart #{self.id}"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey('shop.Product', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        verbose_name='Цена на момент добавления'
    )
    is_selected = models.BooleanField(default=True, verbose_name="Выбран")

    class Meta:
        unique_together = ('cart', 'product')
        verbose_name = 'Элемент корзины'
        verbose_name_plural = 'Элементы корзины'

    @property
    def total_price(self):
        return self.price * self.quantity
    
    def __str__(self):
        return f"{self.product.name} ({self.quantity})"


class OrderQuerySet(models.QuerySet):
    def optimized(self):
        return self.select_related("user").prefetch_related(
            models.Prefetch(
                "orderitem_set", queryset=OrderItem.objects.select_related("product")
            )
        )


class Order(models.Model):
    objects = OrderQuerySet.as_manager()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    products = models.ManyToManyField('shop.Product', through="OrderItem")
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    steam_id = models.CharField(max_length=50)
    is_paid = models.BooleanField(default=False)

    def get_items(self):
        """Возвращает все товары в заказе"""
        return self.orderitem_set.all()

    def __str__(self):
        return f"Order #{self.id}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    product = models.ForeignKey('shop.Product', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"
