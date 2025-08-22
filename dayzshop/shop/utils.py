# shop/utils.py
from .models import Wishlist, WishlistItem

def get_wishlist(user):
    if user.is_authenticated:
        wishlist, created = Wishlist.objects.get_or_create(user=user)
        return wishlist
    return None

def is_in_wishlist(user, product):
    if user.is_authenticated:
        return WishlistItem.objects.filter(wishlist__user=user, product=product).exists()
    return False