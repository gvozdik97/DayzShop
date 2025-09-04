// static/js/catalog.js
document.addEventListener('DOMContentLoaded', function() {
    
    // Поиск товаров
    const searchInput = document.getElementById('searchInput');
    const productsGrid = document.getElementById('productsGrid');
    const noProductsSection = document.querySelector('.no-products');
    
    // Фильтрация по категориям
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    // Кнопки избранного
    const favoriteButtons = document.querySelectorAll('.favorite-btn');

    // Обработчик поиска
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        filterProducts(searchTerm, getActiveCategory());
    });

    // Обработчики категорий
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
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
            
            const heart = this.querySelector('[data-lucide="heart"]');
            heart.style.transform = 'scale(1.2)';
            setTimeout(() => {
                heart.style.transform = 'scale(1)';
            }, 200);
        });
    });

    // Функция получения активной категории
    function getActiveCategory() {
        const activeButton = document.querySelector('.category-btn.active');
        return activeButton ? activeButton.dataset.category : 'all';
    }

    // Функция фильтрации товаров
    function filterProducts(searchTerm, category) {
        const productCards = document.querySelectorAll('.products-grid');
        let visibleCount = 0;

        productCards.forEach(card => {
            const productName = card.querySelector('.product-name').textContent.toLowerCase();
            const productDescription = card.querySelector('.product-description').textContent.toLowerCase();
            const categoryBadge = card.querySelector('.category-badge').textContent.toLowerCase();
            
            const matchesSearch = searchTerm === '' || 
                productName.includes(searchTerm) || 
                productDescription.includes(searchTerm);
            
            const matchesCategory = category === 'all' || 
                categoryBadge.includes(getCategoryName(category).toLowerCase());
            
            if (matchesSearch && matchesCategory) {
                card.style.display = 'block';
                visibleCount++;
                
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100);
            } else {
                card.style.display = 'none';
            }
        });

        if (visibleCount === 0) {
            productsGrid.style.display = 'none';
            noProductsSection.classList.remove('d-none');
        } else {
            productsGrid.style.display = 'block';
            noProductsSection.classList.add('d-none');
        }

        document.querySelector('.catalog-subtitle').textContent = `${visibleCount} товаров`;
    }

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
});