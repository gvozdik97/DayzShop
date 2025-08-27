# shop/urls.py
from django.urls import path
from . import views


app_name = "shop"

urlpatterns = [
    path("", views.index, name="index"),
    path("products/", views.product_list, name="product_list"),
    path(
        "products/<slug:category_slug>/",
        views.product_list,
        name="product_list_by_category",
    ),
    path("products/<int:product_id>/modal/", views.product_modal, name="product_modal"),
    path("products/<int:id>/<slug:slug>/", views.product_detail, name="product_detail"),
    path("contacts/", views.contacts, name="contacts"),
    path("wishlist/", views.wishlist, name="wishlist"),
    path("wishlist/add/<int:product_id>/", views.add_to_wishlist, name="add_to_wishlist"),
    path("wishlist/remove/<int:item_id>/", views.remove_from_wishlist, name="remove_from_wishlist"),
    path("wishlist/toggle/<int:product_id>/", views.toggle_wishlist, name="toggle_wishlist"),
]
