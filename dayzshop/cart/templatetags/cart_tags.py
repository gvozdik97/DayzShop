from django import template
from cart.models import CartItem
from shop.models import WishlistItem


register = template.Library()


@register.filter(name="is_in_cart")
def is_in_cart(product, request):
    """Проверяет, есть ли товар в корзине"""
    if not hasattr(request, "session"):
        return False

    if request.user.is_authenticated:
        return CartItem.objects.filter(
            cart__user=request.user, product=product
        ).exists()
    else:
        if not request.session.session_key:
            return False
        return CartItem.objects.filter(
            cart__session_key=request.session.session_key, product=product
        ).exists()

@register.filter
def multiply(value, arg):
    """Умножает value на arg"""
    try:
        return float(value) * float(arg)
    except (ValueError, TypeError):
        return 0

@register.filter
def floatformat(value, arg=0):
    """Форматирует число с заданным количеством знаков после запятой"""
    try:
        return format(float(value), f'.{arg}f')
    except (ValueError, TypeError):
        return value

@register.filter
def in_wishlist(product, user):
    """Проверяет, находится ли товар в избранном пользователя"""
    if user.is_authenticated:
        return WishlistItem.objects.filter(
            wishlist__user=user, 
            product=product
        ).exists()
    return False