import os
from django.core.files import File
from shop.models import Category, Product

def create_initial_data():
    # Создаём категории
    weapons = Category.objects.create(name="Оружие", slug="weapons")
    transport = Category.objects.create(name="Транспорт", slug="transport")
    equipment = Category.objects.create(name="Снаряжение", slug="equipment")
    
    # Создаём товары
    ak47 = Product.objects.create(
        category=weapons,
        name="АК-47",
        slug="ak-47",
        description="Легендарный автомат Калашникова с магазином на 30 патронов",
        price=299,
        available=True
    )
    ak47.image.save('ak-47.jpg', File(open('static/images/ak-47.jpg', 'rb')))
    
    car = Product.objects.create(
        category=transport,
        name="Гражданский автомобиль",
        slug="civil-car",
        description="Надёжный транспорт для передвижения по карте",
        price=999,
        available=True
    )
    
    backpack = Product.objects.create(
        category=equipment,
        name="Тактический рюкзак",
        slug="tactical-backpack",
        description="Большой рюкзак для хранения добычи (63 слота)",
        price=199,
        available=True
    )

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dayzshop.settings")
    import django
    django.setup()
    create_initial_data()