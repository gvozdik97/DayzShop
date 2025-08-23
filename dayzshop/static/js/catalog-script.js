// Инициализация каталога
document.addEventListener('DOMContentLoaded', function() {
    
    // Поиск товаров
    const searchInput = document.getElementById('searchInput');
    const productsGrid = document.getElementById('productsGrid');
    const noProductsSection = document.querySelector('.no-products');
    
    // Фильтрация по категориям
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    // Кнопки избранного
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    
    // Кнопки "В корзину"
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

    // Обработчик поиска
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        filterProducts(searchTerm, getActiveCategory());
    });

    // Обработчики категорий
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Убираем активный класс у всех кнопок
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            // Добавляем активный класс текущей кнопке
            this.classList.add('active');
            
            const category = this.dataset.category;
            const searchTerm = searchInput.value.toLowerCase();
            filterProducts(searchTerm, category);
        });
    });

    // Обработчики избранного
    favoriteButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('active');
            
            // Анимация сердечка
            const heart = this.querySelector('[data-lucide="heart"]');
            heart.style.transform = 'scale(1.2)';
            setTimeout(() => {
                heart.style.transform = 'scale(1)';
            }, 200);
        });
    });

    // Обработчики "В корзину"
    addToCartButtons.forEach(button => {
        if (!button.disabled) {
            button.addEventListener('click', function() {
                // Анимация кнопки
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);

                // Показать уведомление (можно заменить на toast)
                alert('Товар добавлен в корзину!');
            });
        }
    });

    // Функция получения активной категории
    function getActiveCategory() {
        const activeButton = document.querySelector('.category-btn.active');
        return activeButton ? activeButton.dataset.category : 'all';
    }

    // Функция фильтрации товаров
    function filterProducts(searchTerm, category) {
        const productCards = document.querySelectorAll('.products-grid .col-12');
        let visibleCount = 0;

        productCards.forEach(card => {
            const productName = card.querySelector('.product-name').textContent.toLowerCase();
            const productDescription = card.querySelector('.product-description').textContent.toLowerCase();
            const categoryBadge = card.querySelector('.category-badge').textContent.toLowerCase();
            
            // Проверяем соответствие поиску
            const matchesSearch = searchTerm === '' || 
                productName.includes(searchTerm) || 
                productDescription.includes(searchTerm);
            
            // Проверяем соответствие категории
            const matchesCategory = category === 'all' || 
                categoryBadge.includes(getCategoryName(category).toLowerCase());
            
            if (matchesSearch && matchesCategory) {
                card.style.display = 'block';
                visibleCount++;
                
                // Анимация появления
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100);
            } else {
                card.style.display = 'none';
            }
        });

        // Показываем/скрываем сообщение "Товары не найдены"
        if (visibleCount === 0) {
            productsGrid.style.display = 'none';
            noProductsSection.classList.remove('d-none');
        } else {
            productsGrid.style.display = 'block';
            noProductsSection.classList.add('d-none');
        }

        // Обновляем счетчик в заголовке
        document.querySelector('.catalog-subtitle').textContent = `${visibleCount} товаров`;
    }

    // Функция получения названия категории
    function getCategoryName(category) {
        const categoryNames = {
            'all': 'Все товары',
            'electronics': 'Электроника',
            'clothing': 'Одежда',
            'home': 'Дом',
            'books': 'Книги',
            'sports': 'Спорт'
        };
        return categoryNames[category] || category;
    }

    // Инициализация Lucide иконок после динамических изменений
    function reinitializeIcons() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // Плавная прокрутка к товарам при фильтрации
    function scrollToProducts() {
        document.querySelector('.products-grid').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

});