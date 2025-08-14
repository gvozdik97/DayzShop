from .models import Cart


def get_cart(request):
    """
    Получает корзину для текущего пользователя или сессии
    """
    if request.user.is_authenticated:
        cart, created = Cart.objects.get_or_create(user=request.user)
    else:
        if not request.session.session_key:
            request.session.create()
        cart, created = Cart.objects.get_or_create(
            session_key=request.session.session_key, defaults={"user": None}
        )
    return cart
