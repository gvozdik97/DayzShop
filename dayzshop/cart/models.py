from django.db import models
from shop.models import Product
from django.db.models import Sum
from django.conf import settings


User = settings.AUTH_USER_MODEL


class Cart(models.Model):
    session_key = models.CharField(max_length=40, null=True, blank=True, db_index=True)
    user = models.OneToOneField(User, null=True, blank=True, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

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
        return sum(item.price * item.quantity for item in self.items.all())

    def __str__(self):
        return f"Cart #{self.id}"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    @property
    def total_price(self):
        return self.price * self.quantity


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
    products = models.ManyToManyField(Product, through="OrderItem")
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
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"
