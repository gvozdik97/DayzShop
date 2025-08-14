from django.shortcuts import render, get_object_or_404
from .models import Product, Category
from django.db.models import Q
from django.core.paginator import Paginator
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from cart.models import CartItem
from django.http import HttpResponse, JsonResponse
from cart.utils import get_cart


def index(request):
    featured_products = Product.objects.filter(available=True)[:4]
    return render(request, "shop/index.html", {"featured_products": featured_products})


def product_list(request, category_slug=None):
    category = None
    categories = Category.objects.all()
    products = Product.objects.filter(available=True)

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

    # Пагинация
    paginator = Paginator(products, 8)  # 8 товаров на страницу
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
    ).exclude(id=product.id)[
        :3
    ]  # 3 похожих товара

    return render(
        request,
        "shop/product_detail.html",
        {"product": product, "similar_products": similar_products},
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


def about(request):
    return render(request, "shop/about.html")


def faq(request):
    return render(request, "shop/faq.html")


def product_modal(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
        context = {
            "product": product,
            "in_cart": CartItem.objects.filter(
                cart=get_cart(request), product=product
            ).exists(),
        }
        html = render_to_string("shop/includes/product_modal_content.html", context)
        return JsonResponse(
            {"success": True, "html": html, "product_name": product.name}
        )
    except Product.DoesNotExist:
        return JsonResponse(
            {"success": False, "error": f"Товар с ID {product_id} не найден"},
            status=404,
        )
