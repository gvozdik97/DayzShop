document.addEventListener('DOMContentLoaded', function() {
    const productModal = document.getElementById('productModal');
    if (!productModal) return;
    
    let currentProductId = null;
    
    // Обработчик открытия модального окна
    productModal.addEventListener('show.bs.modal', function(event) {
        const button = event.relatedTarget;
        currentProductId = button.getAttribute('data-product-id');
        
        if (!currentProductId) {
            console.error('Product ID not found');
            return;
        }
        
        const modalBody = document.getElementById('productModalBody');
        const modalTitle = document.getElementById('productModalLabel');
        const modalFooter = productModal.querySelector('.modal-footer');
        const favoriteBtn = document.getElementById('modalFavoriteBtn');
        
        // Устанавливаем product-id для кнопки избранного
        if (favoriteBtn) {
            favoriteBtn.setAttribute('data-product-id', currentProductId);
        }
        
        // Скрываем футер до загрузки данных
        if (modalFooter) modalFooter.style.display = 'none';
        
        // Показываем загрузку
        modalBody.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-warning" role="status">
                    <span class="visually-hidden">Загрузка...</span>
                </div>
            </div>`;
        
        // Загружаем данные
        fetch(`/products/${currentProductId}/modal/`)
            .then(async response => {
                if (!response.ok) {
                    throw new Error('Ошибка сервера');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Вставляем полученный HTML
                    modalBody.innerHTML = data.html;
                    if (modalTitle) modalTitle.textContent = data.product_name;
                    
                    // Обновляем кнопки в футере
                    updateFooterButtons(data.in_cart, data.in_wishlist);
                    
                    // Показываем футер
                    if (modalFooter) modalFooter.style.display = 'block';
                    
                    // Инициализируем иконки
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }
                } else {
                    showModalError(modalBody, data.error || 'Ошибка загрузки данных');
                }
            })
            .catch(error => {
                console.error('Fetch error:', error);
                showModalError(modalBody, error.message);
            });
    });
    
    // Обработчик закрытия модального окна
    productModal.addEventListener('hidden.bs.modal', function() {
        currentProductId = null;
    });
    
    // Обработчик клика на кнопку избранного в модальном окне
    document.addEventListener('click', function(event) {
        const favoriteBtn = event.target.closest('#modalFavoriteBtn');
        if (favoriteBtn) {
            event.preventDefault();
            toggleFavoriteFromModal(favoriteBtn);
        }
    });
    
    function updateFooterButtons(inCart, inWishlist) {
        const addToCartBtn = document.getElementById('modalAddToCartBtn');
        const favoriteBtn = document.getElementById('modalFavoriteBtn');
        
        // Обновляем кнопку корзины
        if (addToCartBtn) {
            if (inCart) {
                addToCartBtn.innerHTML = '<i data-lucide="check" class="me-3 lucide-icon-smaller"></i>В корзине';
                addToCartBtn.classList.add('added-to-cart');
                addToCartBtn.disabled = true;
            } else {
                addToCartBtn.innerHTML = '<i data-lucide="shopping-cart" class="me-3 lucide-icon-smaller"></i>В корзину';
                addToCartBtn.classList.remove('added-to-cart');
                addToCartBtn.disabled = false;
            }
        }
        
        // Обновляем кнопку избранного
        if (favoriteBtn) {
            updateFavoriteButton(favoriteBtn, inWishlist);
        }
        
        // Инициализируем иконки
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    function updateFavoriteButton(button, isFavorite) {
        if (!button) return;
        
        const icon = button.querySelector('i');
        if (!icon) return;
        
        if (isFavorite) {
            icon.setAttribute('fill', 'currentColor');
            button.setAttribute('title', 'Удалить из избранного');
            button.classList.add('active');
        } else {
            icon.removeAttribute('fill');
            button.setAttribute('title', 'Добавить в избранное');
            button.classList.remove('active');
        }
    }
    
    function toggleFavoriteFromModal(button) {
        const productId = button.getAttribute('data-product-id');
        
        if (!productId) {
            showToast('Не удалось определить товар', 'error');
            return;
        }
        
        // Проверяем авторизацию
        if (!isUserAuthenticated()) {
            showToast('Для добавления в избранное необходимо авторизоваться', 'error');
            return;
        }
        
        // Показываем loading state
        const originalHtml = button.innerHTML;
        button.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
        button.disabled = true;
        
        // Получаем CSRF токен
        const csrfToken = getCookie('csrftoken');
        if (!csrfToken) {
            showToast('Ошибка безопасности. Перезагрузите страницу.', 'error');
            button.innerHTML = originalHtml;
            button.disabled = false;
            return;
        }
        
        fetch(`/shop/toggle_wishlist/${productId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin'
        })
        .then(async response => {
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }
            return data;
        })
        .then(data => {
            if (data.success) {
                // Обновляем состояние кнопки
                updateFavoriteButton(button, data.in_wishlist);
                
                // Показываем уведомление
                showToast(data.message || 'Избранное обновлено');
                
                // Обновляем состояние на странице
                updateWishlistButtonOnPage(productId, data.in_wishlist);
            } else {
                throw new Error(data.error || 'Ошибка обновления избранного');
            }
        })
        .catch(error => {
            console.error('Error details:', error);
            
            if (error.message.includes('CSRF')) {
                showToast('Ошибка безопасности. Перезагрузите страницу.', 'error');
            } else if (error.message.includes('401') || error.message.includes('403')) {
                showToast('Необходимо авторизоваться', 'error');
            } else {
                showToast(error.message || 'Ошибка при обновлении избранного', 'error');
            }
        })
        .finally(() => {
            // Восстанавливаем кнопку
            button.innerHTML = originalHtml;
            button.disabled = false;
            
            // Инициализируем иконки
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });
    }
    
    function isUserAuthenticated() {
        // Простая проверка - можно улучшить, если есть мета-тег с информацией о пользователе
        const metaAuth = document.querySelector('meta[name="user-authenticated"]');
        if (metaAuth) {
            return metaAuth.getAttribute('content') === 'true';
        }
        
        // Альтернативная проверка по наличию CSRF токена
        return !!getCookie('csrftoken');
    }
    
    function updateWishlistButtonOnPage(productId, isFavorite) {
        // Находим все кнопки избранного для этого товара на странице
        const wishlistButtons = document.querySelectorAll('[data-product-id]');
        
        wishlistButtons.forEach(button => {
            const btnProductId = button.getAttribute('data-product-id');
            if (btnProductId === productId.toString()) {
                updateFavoriteButton(button, isFavorite);
            }
        });
    }
    
    function getCookie(name) {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [key, value] = cookie.trim().split('=');
            if (key === name) return decodeURIComponent(value);
        }
        return null;
    }
    
    function showToast(message, type = 'success') {
        // Используем toast из cart.js если он есть
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
            return;
        }
        
        // Простая реализация toast
        const toastContainer = document.getElementById('toast-container') || createToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0`;
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // Удаляем toast после скрытия
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
    
    function createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
        return container;
    }
    
    function showModalError(container, message) {
        if (!container) return;
        
        container.innerHTML = `
            <div class="alert alert-danger m-0">
                <i class="bi bi-exclamation-triangle"></i>
                ${message}
                <button class="btn btn-sm btn-outline-secondary mt-2" 
                        onclick="location.reload()">
                    Обновить страницу
                </button>
            </div>`;
    }
    
    // Обработчик для кнопки корзины
    document.addEventListener('click', function(event) {
        const addToCartBtn = event.target.closest('#modalAddToCartBtn');
        if (addToCartBtn && !addToCartBtn.classList.contains('added-to-cart')) {
            event.preventDefault();
            addToCartFromModal();
        }
    });
    
    function addToCartFromModal() {
        if (!currentProductId) return;
        
        const addToCartBtn = document.getElementById('modalAddToCartBtn');
        if (!addToCartBtn) return;
        
        const originalText = addToCartBtn.innerHTML;
        
        addToCartBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Добавляем...';
        addToCartBtn.disabled = true;
        
        const csrfToken = getCookie('csrftoken');
        
        fetch(`/cart/add/${currentProductId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': csrfToken,
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: `quantity=1`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                addToCartBtn.innerHTML = '<i data-lucide="check" class="me-3 lucide-icon-smaller"></i>В корзине';
                addToCartBtn.classList.add('added-to-cart');
                addToCartBtn.disabled = true;
                updateCartCounter(data.cart_count || data.cart_total_items || 0);
                showToast('Товар добавлен в корзину');
            } else {
                throw new Error(data.error || 'Ошибка добавления');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            addToCartBtn.innerHTML = originalText;
            addToCartBtn.disabled = false;
            showToast(error.message || 'Ошибка добавления в корзину', 'error');
        });
    }
    
    function updateCartCounter(count) {
        const cartCounter = document.querySelector('.cart-counter');
        if (cartCounter) {
            cartCounter.textContent = count;
        }
    }
});