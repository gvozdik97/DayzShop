from .models import Cart
from django.contrib.sessions.backends.db import SessionStore

def get_cart(request):
    """
    Получает корзину для текущего пользователя или сессии
    """
    # Для авторизованных пользователей
    if request.user.is_authenticated:
        cart, created = Cart.objects.get_or_create(user=request.user)
        return cart
    
    # Для анонимных пользователей (по сессии)
    if not request.session.session_key:
        request.session.create()
    
    session_key = request.session.session_key
    cart, created = Cart.objects.get_or_create(session_key=session_key)
    return cart