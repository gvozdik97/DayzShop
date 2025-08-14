from django.shortcuts import render, redirect, get_object_or_404
from shop.models import Product
from django.contrib import messages
from .models import CartItem, Order, OrderItem
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from cart.utils import get_cart
from django.db.models import Prefetch


def cart_detail(request):
    cart = get_cart(request)
    return render(request, "cart/detail.html", {"cart": cart})


def add_to_cart(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    cart = get_cart(request)
    quantity = int(request.POST.get("quantity", 1))

    # Проверяем, есть ли уже товар в корзине
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        defaults={"quantity": quantity, "price": product.price},
    )

    if not created:
        cart_item.quantity += quantity
        cart_item.save()
        messages.success(request, f'Количество "{product.name}" обновлено в корзине')
    else:
        messages.success(request, f'"{product.name}" добавлен в корзину')

    # Редирект на предыдущую страницу или на страницу товара
    redirect_url = request.META.get(
        "HTTP_REFERER", reverse("shop:product_detail", args=[product.id, product.slug])
    )
    return redirect(redirect_url)


def update_cart_item(request, item_id):
    cart_item = get_object_or_404(CartItem, id=item_id, cart=get_cart(request))
    new_quantity = int(request.POST.get("quantity", 1))

    if new_quantity > 0:
        cart_item.quantity = new_quantity
        cart_item.save()
        messages.success(request, f'Количество "{cart_item.product.name}" обновлено')
    else:
        cart_item.delete()
        messages.success(request, f'"{cart_item.product.name}" удален из корзины')

    return redirect("cart:detail")


def remove_from_cart(request, item_id):
    cart_item = get_object_or_404(CartItem, id=item_id, cart=get_cart(request))
    product_name = cart_item.product.name
    cart_item.delete()

    messages.success(request, f'"{product_name}" удален из корзины')
    return redirect("cart:detail")


def clear_cart(request):
    cart = get_cart(request)
    cart.items.all().delete()
    messages.success(request, "✅ Корзина полностью очищена")
    return redirect("cart:detail")


def order_list(request):
    orders = (
        Order.objects.filter(user=request.user)
        .select_related("user")
        .prefetch_related(
            Prefetch(
                "orderitem_set", queryset=OrderItem.objects.select_related("product")
            )
        )
    )
    return render(request, "cart/order_list.html", {"orders": orders})


@login_required
def order_detail(request, pk):
    order = get_object_or_404(
        Order.objects.select_related("user").prefetch_related(
            Prefetch(
                "orderitem_set", queryset=OrderItem.objects.select_related("product")
            )
        ),
        pk=pk,
        user=request.user,  # Проверка прав
    )
    return render(request, "cart/order_detail.html", {"order": order})


@login_required
def checkout(request):
    cart = get_cart(request)

    if request.method == "POST":
        try:
            # Правильное создание заказа без вызова Decimal как функции
            order = Order.objects.create(
                user=request.user if request.user.is_authenticated else None,
                total_price=cart.get_total_price,  # Без скобок, так как это property
                steam_id=request.POST.get("steam_id"),
            )

            # Переносим товары
            for item in cart.items.all():
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    price=item.price,  # Уже Decimal значение
                )

            cart.items.all().delete()
            return redirect("cart:checkout_success")

        except Exception as e:
            messages.error(request, f"Ошибка оформления: {str(e)}")

    return render(
        request,
        "cart/checkout.html",
        {"cart": cart, "total_price": cart.get_total_price},  # Передаем как свойство
    )
