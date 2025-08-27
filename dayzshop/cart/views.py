from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.db.models import Prefetch
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from decimal import Decimal
from cart.utils import get_cart
from shop.models import Product, WishlistItem
from .models import CartItem, Order, OrderItem


def cart_detail(request):
    cart = get_cart(request)
    
    all_selected = False
    selected_count = 0
    total_savings = Decimal('0')
    total_price_selected = Decimal('0')
    
    if cart.items.exists():
        all_selected = not cart.items.filter(is_selected=False).exists()
        selected_items = cart.items.filter(is_selected=True)
        selected_count = selected_items.count()
        
        for item in selected_items:
            if item.product.is_on_sale and item.product.old_price:
                total_savings += (item.product.old_price - item.product.price) * item.quantity
                total_price_selected += item.product.old_price * item.quantity
            else:
                total_price_selected += item.product.price * item.quantity
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        response_data = {
            'total_price_selected': float(total_price_selected),
            'total_price_after_discount': float(cart.get_total_price_after_discount),
            'total_savings': float(total_savings),
            'all_selected': all_selected,
            'selected_count': selected_count
        }
        # print("AJAX Response:", response_data)  # Для отладки
        return JsonResponse(response_data)
    
    if request.user.is_authenticated:
        wishlist_products = WishlistItem.objects.filter(
            wishlist__user=request.user
        ).values_list('product_id', flat=True)
        
        for item in cart.items.all():
            item.product.in_wishlist = item.product.id in wishlist_products
    
    return render(request, "cart/detail.html", {
        "cart": cart,
        "all_selected": all_selected,
        "selected_count": selected_count,
        "total_savings": total_savings,
        "total_price_selected": total_price_selected
    })

@transaction.atomic
def add_to_cart(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    cart = get_cart(request)
    quantity = int(request.POST.get("quantity", 1))
    # price = product.old_price if product.is_on_sale else product.price
    price = product.price

    try:
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={
                'quantity': quantity,
                'price': price
            }
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        return JsonResponse({
            'success': True,
            'message': f'"{product.name}" добавлен в корзину',
            'cart_count': cart.items.count(),
            'cart_total': str(cart.get_total_price)
        })
    except Exception as e:
        transaction.set_rollback(True)
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=400)

def update_cart_item(request, item_id):
    cart_item = get_object_or_404(CartItem, id=item_id, cart=get_cart(request))
    new_quantity = int(request.POST.get("quantity", 1))

    if new_quantity > 0:
        cart_item.quantity = new_quantity
        cart_item.save()
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            # Рассчитываем актуальные суммы
            item_total = float(cart_item.product.price * cart_item.quantity)
            item_total_old = None
            
            if cart_item.product.is_on_sale and cart_item.product.old_price:
                item_total_old = float(cart_item.product.old_price * cart_item.quantity)
            
            return JsonResponse({
                'success': True,
                'new_quantity': cart_item.quantity,
                'item_total': item_total,
                'item_total_old': item_total_old,
                'message': f'Количество "{cart_item.product.name}" обновлено'
            })
    else:
        cart_item.delete()
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': True,
                'new_quantity': 0,
                'item_total': 0,
                'item_total_old': None,
                'message': f'"{cart_item.product.name}" удален из корзины'
            })

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

@login_required
def order_list(request):
    orders = (
        Order.objects.filter(user=request.user)
        .select_related("user")
        .prefetch_related(
            Prefetch(
                "orderitem_set", 
                queryset=OrderItem.objects.select_related("product")
            )
        )
        .order_by('-created_at')  # Сортировка по дате (новые сначала)
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
    
    # Получаем только выбранные товары
    selected_items = cart.items.filter(is_selected=True)
    
    if not selected_items.exists():
        messages.error(request, "Выберите хотя бы один товар для оформления заказа")
        return redirect("cart:detail")

    if request.method == "POST":
        try:
            # Создаем заказ с общей суммой только выбранных товаров
            order = Order.objects.create(
                user=request.user,
                total_price=sum(
                    item.product.price * item.quantity 
                    for item in selected_items
                ),
                steam_id=request.POST.get("steam_id"),
            )

            # Переносим только выбранные товары
            for item in selected_items:
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    price=item.product.price,
                )

            # Удаляем только выбранные товары из корзины
            selected_items.delete()
            
            messages.success(request, "Заказ успешно оформлен!")
            return redirect("cart:checkout_success", order_id=order.id)

        except Exception as e:
            messages.error(request, f"Ошибка оформления заказа: {str(e)}")
            return redirect("cart:checkout")

    return render(
        request,
        "cart/checkout.html",
        {
            "cart": cart,
            "selected_items": selected_items,
            "total_price": sum(
                item.product.price * item.quantity 
                for item in selected_items
            )
        }
    )

@login_required
def checkout_success(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    return render(request, "cart/checkout_success.html", {"order": order})

@require_POST
def toggle_item_selection(request, item_id):
    cart_item = get_object_or_404(CartItem, id=item_id, cart=get_cart(request))
    cart_item.is_selected = not cart_item.is_selected
    cart_item.save()
    
    cart = cart_item.cart
    selected_items = cart.items.filter(is_selected=True)
    
    # Вычисляем суммы с учетом скидок
    total_price_after_discount = sum(
        item.product.price * item.quantity 
        for item in selected_items
    )
    
    total_price_selected = Decimal('0')  # Сумма выбранных без скидки
    total_savings = Decimal('0')         # Экономия
    
    for item in selected_items:
        if item.product.is_on_sale and item.product.old_price:
            total_savings += (item.product.old_price - item.product.price) * item.quantity
            total_price_selected += item.product.old_price * item.quantity
        else:
            total_price_selected += item.product.price * item.quantity
    
    return JsonResponse({
        'success': True,
        'is_selected': cart_item.is_selected,
        'selected_count': selected_items.count(),
        'total_price_selected': float(total_price_selected),  # Без скидки
        'total_price_after_discount': float(total_price_after_discount),  # Со скидкой
        'total_savings': float(total_savings)
    })

@require_POST
def select_all_items(request):
    cart = get_cart(request)
    is_select_all = request.POST.get('select_all', 'false') == 'true'
    
    cart.items.all().update(is_selected=is_select_all)
    
    selected_items = cart.items.filter(is_selected=True)
    
    total_price_after_discount = sum(
        item.product.price * item.quantity 
        for item in selected_items
    )
    
    total_price_selected = Decimal('0')
    total_savings = Decimal('0')   
    
    for item in selected_items:
        if item.product.is_on_sale and item.product.old_price:
            total_savings += (item.product.old_price - item.product.price) * item.quantity
            total_price_selected += item.product.old_price * item.quantity
        else:
            total_price_selected += item.product.price * item.quantity
    
    return JsonResponse({
        'success': True,
        'is_select_all': is_select_all,
        'selected_count': selected_items.count(),
        'total_price_selected': float(total_price_selected),  # Без скидки
        'total_price_after_discount': float(total_price_after_discount),  # Со скидкой
        'total_savings': float(total_savings)
    })
