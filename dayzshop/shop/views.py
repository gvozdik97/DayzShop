from django.shortcuts import render, get_object_or_404,redirect
from django.contrib import messages
from .models import Product, Category, Wishlist, WishlistItem
from django.db.models import Q
from django.core.paginator import Paginator
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from cart.models import CartItem
from django.http import HttpResponse, JsonResponse
from cart.utils import get_cart
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST


def index(request):
    featured_products = Product.objects.filter(available=True)[:4]
    return render(request, "shop/index.html", {"featured_products": featured_products})


def product_list(request, category_slug=None):
    category = None
    categories = Category.objects.all()
    products = Product.objects.filter(available=True).select_related('category')

    # Поиск
    search_query = request.GET.get("search", "")
    if search_query:
        products = products.filter(
            Q(name__icontains=search_query) | Q(description__icontains=search_query)
        )

    # Фильтрация по категории
    if category_slug:
        category = get_object_or_404(Category, slug=category_slug)
        products = products.filter(category=category)

    # Проверяем избранное для авторизованных пользователей
    if request.user.is_authenticated:
        wishlist_products = WishlistItem.objects.filter(
            wishlist__user=request.user
        ).values_list('product_id', flat=True)
        
        for product in products:
            product.in_wishlist = product.id in wishlist_products

    # Пагинация
    paginator = Paginator(products, 8)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)

    return render(
        request,
        "shop/product_list.html",
        {
            "category": category,
            "categories": categories,
            "page_obj": page_obj,
        },
    )

def product_detail(request, id, slug):
    product = get_object_or_404(Product, id=id, slug=slug)
    similar_products = Product.objects.filter(
        category=product.category, available=True
    ).exclude(id=product.id)[:3]
    
    # Проверяем, в избранном ли товар
    in_wishlist = False
    if request.user.is_authenticated:
        in_wishlist = WishlistItem.objects.filter(
            wishlist__user=request.user, product=product
        ).exists()

    return render(
        request,
        "shop/product_detail.html",
        {
            "product": product, 
            "similar_products": similar_products,
            "in_wishlist": in_wishlist
        },
    )

def contacts(request):
    if request.method == "POST":
        email = request.POST.get("email")
        message = request.POST.get("message")
        send_mail(
            "Сообщение с сайта DayZ Donate",
            f"От: {email}\n\n{message}",
            settings.DEFAULT_FROM_EMAIL,
            [settings.CONTACT_EMAIL],
            fail_silently=False,
        )
        return render(request, "shop/contacts.html", {"success": True})
    return render(request, "shop/contacts.html")

def product_modal(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
        context = {
            "product": product,
            "in_cart": CartItem.objects.filter(
                cart=get_cart(request), product=product
            ).exists(),
            "in_wishlist": False
        }

        if request.user.is_authenticated:
            context['in_wishlist'] = WishlistItem.objects.filter(
                wishlist__user=request.user, product=product
            ).exists()
        
        html = render_to_string("shop/includes/product_modal_content.html", context)
        return JsonResponse({
            "success": True, 
            "html": html, 
            "product_name": product.name,
            "in_cart": context["in_cart"],
            "in_wishlist": context["in_wishlist"]
        })
    except Product.DoesNotExist:
        return JsonResponse(
            {"success": False, "error": f"Товар с ID {product_id} не найден"},
            status=404,
        )

@login_required
def wishlist(request):
    wishlist, created = Wishlist.objects.get_or_create(user=request.user)
    wishlist_items = wishlist.items.select_related('product')
    
    return render(request, "shop/wishlist.html", {
        "wishlist": wishlist,
        "wishlist_items": wishlist_items
    })

@login_required
@require_POST
def add_to_wishlist(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    wishlist, created = Wishlist.objects.get_or_create(user=request.user)
    
    wishlist_item, created = WishlistItem.objects.get_or_create(
        wishlist=wishlist,
        product=product
    )
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({
            'success': True,
            'message': f'"{product.name}" добавлен в избранное',
            'in_wishlist': True
        })
    
    messages.success(request, f'"{product.name}" добавлен в избранное')
    return redirect(request.META.get('HTTP_REFERER', 'shop:product_list'))

@login_required
@require_POST
def remove_from_wishlist(request, item_id):
    wishlist_item = get_object_or_404(WishlistItem, id=item_id, wishlist__user=request.user)
    product_name = wishlist_item.product.name
    wishlist_item.delete()
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({
            'success': True,
            'message': f'"{product_name}" удален из избранного',
            'in_wishlist': False
        })
    
    messages.success(request, f'"{product_name}" удален из избранного')
    return redirect('shop:wishlist')

@login_required
@require_POST
def toggle_wishlist(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    wishlist, created = Wishlist.objects.get_or_create(user=request.user)
    
    try:
        wishlist_item = WishlistItem.objects.get(wishlist=wishlist, product=product)
        wishlist_item.delete()
        in_wishlist = False
        message = f'"{product.name}" удален из избранного'
    except WishlistItem.DoesNotExist:
        WishlistItem.objects.create(wishlist=wishlist, product=product)
        in_wishlist = True
        message = f'"{product.name}" добавлен в избранное'
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({
            'success': True,
            'in_wishlist': in_wishlist,
            'message': message
        })
    
    messages.success(request, message)
    return redirect(request.META.get('HTTP_REFERER', 'shop:product_list'))