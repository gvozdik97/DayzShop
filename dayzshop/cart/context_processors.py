# cart/context_processors.py
from .utils import get_cart

def cart(request):
    return {'cart': get_cart(request)}