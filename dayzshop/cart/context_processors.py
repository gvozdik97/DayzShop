from .models import Cart

def cart(request):
    if request.user.is_authenticated:
        cart, created = Cart.objects.get_or_create(user=request.user)
    else:
        cart = None  # Или реализация для анонимных пользователей
    return {'cart': cart}