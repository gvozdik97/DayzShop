from django.db import models
from django.urls import reverse
from django.core.validators import MinValueValidator
from django.conf import settings


User = settings.AUTH_USER_MODEL

class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name="Название")
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name = "Категория"
        verbose_name_plural = "Категории"

    def get_absolute_url(self):
        return reverse("shop:product_list_by_category", args=[self.slug])

    def __str__(self):
        return self.name

class Product(models.Model):
    category = models.ForeignKey(
        Category,
        related_name="products",
        on_delete=models.CASCADE,
        verbose_name="Категория",
    )
    name = models.CharField(max_length=200, verbose_name="Название")
    slug = models.SlugField(unique=True)
    description = models.TextField(verbose_name="Описание")
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name="Цена",
    )
    old_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Старая цена (если есть скидка)"
    )
    is_on_sale = models.BooleanField(default=False, verbose_name="Скидка активна")
    image = models.ImageField(upload_to="products/", verbose_name="Изображение")
    available = models.BooleanField(default=True, verbose_name="Доступен")
    created = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        verbose_name = "Товар"
        verbose_name_plural = "Товары"
        ordering = ["-created"]

    def get_absolute_url(self):
        return reverse("shop:product_detail", args=[self.id, self.slug])

    @property
    def discount_percentage(self):
        """Автоматический расчёт % скидки"""
        if self.is_on_sale and self.old_price:
            return int(100 - (self.price / self.old_price * 100))
        return 0
    
    @property
    def savings(self):
        """Расчет экономии при скидке"""
        if self.is_on_sale and self.old_price:
            return self.old_price - self.price
        return 0

    def __str__(self):
        return f"{self.name} - {self.price}₽" + (
            f" (скидка {self.discount_percentage}%)" if self.is_on_sale else ""
        )


class Wishlist(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wishlist')
    products = models.ManyToManyField('Product', through='WishlistItem', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Wishlist of {self.user}"

class WishlistItem(models.Model):
    wishlist = models.ForeignKey(Wishlist, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('Product', on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('wishlist', 'product')
        verbose_name = 'Элемент избранного'
        verbose_name_plural = 'Элементы избранного'

    def __str__(self):
        return f"{self.product.name} in {self.wishlist}"
