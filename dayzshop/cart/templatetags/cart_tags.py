from django import template
from cart.models import CartItem

register = template.Library()

@register.filter(name='is_in_cart')
def is_in_cart(product, request):
    """Проверяет, есть ли товар в корзине"""
    if not hasattr(request, 'session'):
        return False
        
    if request.user.is_authenticated:
        return CartItem.objects.filter(
            cart__user=request.user,
            product=product
        ).exists()
    else:
        if not request.session.session_key:
            return False
        return CartItem.objects.filter(
            cart__session_key=request.session.session_key,
            product=product
        ).exists()