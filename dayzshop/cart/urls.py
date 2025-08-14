from django.urls import path
from . import views

app_name = "cart"

urlpatterns = [
    path("", views.cart_detail, name="detail"),
    path("add/<int:product_id>/", views.add_to_cart, name="add"),
    path("remove/<int:item_id>/", views.remove_from_cart, name="remove"),
    path("clear/", views.clear_cart, name="clear"),
    path("orders/", views.order_list, name="order_list"),
    path("order/<int:pk>/", views.order_detail, name="order_detail"),
    path("checkout/", views.checkout, name="checkout"),
    path("update/<int:item_id>/", views.update_cart_item, name="update"),
]
