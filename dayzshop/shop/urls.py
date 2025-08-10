# shop/urls.py
from django.urls import path
from . import views

app_name = 'shop' 

urlpatterns = [
    path('', views.index, name='index'),
    path('products/', views.product_list, name='product_list'),
    path('products/<slug:category_slug>/', views.product_list, name='product_list_by_category'),
    path('products/<int:id>/<slug:slug>/', views.product_detail, name='product_detail'),
    path('products/<int:product_id>/modal/', views.product_modal, name='product_modal'),
    # path('search/', views.product_search, name='product_search'),
    path('contacts/', views.contacts, name='contacts'),
    path('about/', views.about, name='about'),
    path('faq/', views.faq, name='faq'),
    
]