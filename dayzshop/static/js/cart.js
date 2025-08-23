// static/js/cart.js
document.addEventListener('DOMContentLoaded', function() {
    // ==================== АНИМАЦИЯ НАЗВАНИЙ ТОВАРОВ ====================
    // function initMarqueeTitles() {
    //     document.querySelectorAll('.product-name').forEach(function(el) {
    //         const container = el.parentElement;
    //         const textWidth = el.scrollWidth;
    //         const containerWidth = container.offsetWidth;
            
    //         if (textWidth > containerWidth) {
    //             el.classList.add('marquee');
                
    //             // Создаем клон для плавной анимации
    //             const clone = el.cloneNode(true);
    //             clone.classList.add('marquee-clone');
    //             container.appendChild(clone);
    //         }
    //     });
    // }

    // initMarqueeTitles();

    // ==================== УВЕДОМЛЕНИЯ ====================
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.innerHTML = `
            <i class="bi ${type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ==================== ФУНКЦИИ КОРЗИНЫ ====================
    function setCartButtonState(button, state) {
        const states = {
            loading: {
                html: '<span class="spinner"></span> Добавляем...',
                class: 'loading',
                disabled: true,
                redirect: false
            },
            added: {
                html: '<i class="bi bi-check-circle-fill"></i> В корзине',
                class: 'added-to-cart',
                disabled: false,
                redirect: true
            },
            default: {
                html: '<i class="bi bi-cart2"></i> В корзину',
                class: '',
                disabled: false,
                redirect: false
            },
            error: {
                html: '<i class="bi bi-exclamation-triangle"></i> Ошибка',
                class: 'error',
                disabled: false,
                redirect: false
            }
        };
        
        button.innerHTML = states[state].html;
        button.className = `btn add-to-cart-btn ${states[state].class}`;
        button.disabled = states[state].disabled;

        if (state === 'added') {
            button.dataset.isInCart = 'true';
            button.style.cursor = 'pointer';
        } else {
            button.removeAttribute('data-is-in-cart');
        }
    }

    // Функция для обновления состояния ссылки оформления заказа
    function updateCheckoutLinkState() {
        const checkboxes = document.querySelectorAll('.cart-item-checkbox:checked');
        const checkoutLink = document.querySelector('a.checkout-btn, a[href*="checkout"]');
        
        if (checkoutLink) {
            if (checkboxes.length === 0) {
                // Блокируем ссылку
                checkoutLink.classList.add('disabled');
                checkoutLink.style.opacity = '0.6';
                checkoutLink.style.cursor = 'not-allowed';
                checkoutLink.style.pointerEvents = 'none';
                
                // Сохраняем оригинальный href
                if (!checkoutLink.dataset.originalHref) {
                    checkoutLink.dataset.originalHref = checkoutLink.href;
                }
                checkoutLink.removeAttribute('href');
            } else {
                // Разблокируем ссылку
                checkoutLink.classList.remove('disabled');
                checkoutLink.style.opacity = '1';
                checkoutLink.style.cursor = 'pointer';
                checkoutLink.style.pointerEvents = 'auto';
                
                // Восстанавливаем оригинальный href
                if (checkoutLink.dataset.originalHref) {
                    checkoutLink.href = checkoutLink.dataset.originalHref;
                }
            }
        }
    }

    // Функция для обновления общих сумм корзины
    async function updateCartTotals() {
        try {
            const response = await fetch(window.location.href, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            const data = await response.json();
            
            if (data) {
                // Обновляем сумму выбранных товаров
                if (document.querySelector('.selected-items-price')) {
                    document.querySelector('.selected-items-price').textContent = 
                        `${parseFloat(data.total_price_selected || 0).toLocaleString('ru-RU')} ₽`;
                }
                
                // Обновляем счетчик выбранных товаров
                if (document.querySelector('.selected-items-count')) {
                    document.querySelector('.selected-items-count').textContent = data.selected_count;
                }
                
                // Обновляем итоговую сумму
                if (document.querySelector('.summary-total-price')) {
                    document.querySelector('.summary-total-price').textContent = 
                        `${parseFloat(data.total_price_after_discount || 0).toLocaleString('ru-RU')} ₽`;
                }
                
                // Обновляем блок скидки
                const savingsElement = document.querySelector('.selected-items-savings');
                const savingsContainer = document.querySelector('.cart-savings');
                
                if (savingsElement && savingsContainer) {
                    if (data.total_savings > 0 && data.selected_count > 0) {
                        savingsElement.textContent = `- ${parseFloat(data.total_savings || 0).toLocaleString('ru-RU')} ₽`;
                        savingsContainer.style.display = 'flex';
                    } else {
                        savingsContainer.style.display = 'none';
                    }
                }

                // Обновляем состояние кнопки оформления заказа
                updateCheckoutLinkState();
            }
        } catch (error) {
            console.error('Error updating totals:', error);
        }
    }

    function checkSelectAllState() {
        const checkboxes = document.querySelectorAll('.cart-item-checkbox:checked');
        const selectAll = document.getElementById('selectAll');
        if (selectAll) {
            selectAll.checked = checkboxes.length === document.querySelectorAll('.cart-item-checkbox').length;
        }
        updateCheckoutLinkState();
    }

    async function addToCart(productId, button) {
        try {
            setCartButtonState(button, 'loading');
            
            const response = await fetch(`/cart/add/${productId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: 'quantity=1'
            });
            
            const data = await response.json();
            
            if (data.success) {
                setCartButtonState(button, 'added');
                updateCartCounter(data.cart_count);
                showToast('Товар добавлен в корзину');
                // Создаём счётчик, если его нет
                if (!document.querySelector('.mini-badge')) {
                    const cartUrl = document.getElementById('cart-data').dataset.cartUrl;
                    const cartIcon = document.querySelector(`a[href="${cartUrl}"]`);
                    
                    if (cartIcon) {
                        const badge = document.createElement('span');
                        badge.className = 'position-absolute top-0 start-100 translate-middle bg-danger rounded-circle badge mini-badge';
                        badge.textContent = data.cart_count;
                        
                        // Проверяем, есть ли уже обёртка для значка
                        let iconContainer = cartIcon.querySelector('.position-relative');
                        if (!iconContainer) {
                            iconContainer = document.createElement('div');
                            iconContainer.className = 'position-relative mx-auto';
                            iconContainer.style.width = 'fit-content';
                            
                            // Перемещаем иконку внутрь контейнера
                            while (cartIcon.firstChild) {
                                iconContainer.appendChild(cartIcon.firstChild);
                            }
                            cartIcon.appendChild(iconContainer);
                        }
                        
                        iconContainer.appendChild(badge);
                    }
                }
            } else {
                setCartButtonState(button, 'error');
                showToast('Ошибка добавления', 'error');
                setTimeout(() => setCartButtonState(button, 'default'), 2000);
            }
        } catch (error) {
            console.error('Error:', error);
            setCartButtonState(button, 'error');
            showToast('Ошибка соединения', 'error');
            setTimeout(() => setCartButtonState(button, 'default'), 2000);
        }
    }

    async function updateCartItem(itemId, newQuantity, input) {
        try {
            const response = await fetch(`/cart/update/${itemId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': getCookie('csrftoken'),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: `quantity=${newQuantity}`
            });
            
            const data = await response.json();
            
            if (data.success) {
                input.value = data.new_quantity;
                
                // Обновляем отображение цены товара
                const priceElement = input.closest('.cart-price-section').querySelector('.cart-price-main');
                if (priceElement && data.item_total) {
                    priceElement.textContent = `${parseFloat(data.item_total).toLocaleString('ru-RU')} ₽`;
                }
                
                // Обновляем старую цену (если есть)
                const oldPriceElement = input.closest('.cart-price-section').querySelector('.cart-price-old');
                if (oldPriceElement && data.item_total_old) {
                    oldPriceElement.textContent = `${parseFloat(data.item_total_old).toLocaleString('ru-RU')} ₽`;
                }
                
                // ВАЖНО: Обновляем общие суммы в блоке итогов
                if (typeof updateCartTotals === 'function') {
                    await updateCartTotals();
                }
                
                showToast('Количество обновлено');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Ошибка обновления', 'error');
            location.reload();
        }
    }

    async function removeCartItem(itemId, button) {
        try {
            button.disabled = true;
            
            const response = await fetch(button.href, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                const row = button.closest('tr');
                row.classList.add('removing');
                setTimeout(() => row.remove(), 500);
                
                updateCartCounter(data.cart_count);
                showToast('Товар удален');
                
                if (data.cart_count === 0) {
                    document.querySelector('.cart-table')?.insertAdjacentHTML('afterend', 
                        '<div class="cart-empty-message">Корзина пуста</div>');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Ошибка удаления', 'error');
            button.disabled = false;
        }
    }

    // ==================== ОБРАБОТЧИКИ СОБЫТИЙ ====================
    // Добавление в корзину
    document.body.addEventListener('click', function(e) {
        const btn = e.target.closest('.add-to-cart-btn');
        if (!btn) return;
        
        e.preventDefault();
        
        if (btn.dataset.isInCart === 'true' || btn.classList.contains('added-to-cart')) {
            window.location.href = document.getElementById('cart-data').dataset.cartUrl;
            return;
        }
        
        addToCart(btn.dataset.productId, btn);
    });

    // Изменение количества
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            const itemId = this.dataset.itemId;
            fetch(`/cart/update/${itemId}/`, {
                method: 'POST',
                body: `quantity=${this.value}`
            }).then(response => response.json());
        });
    });

    // Кнопки +/-
    document.querySelectorAll('.plus-btn, .minus-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.closest('.input-group').querySelector('.quantity-input');
            const itemId = input.dataset.itemId;
            let newQuantity = parseInt(input.value);
           
            if (this.classList.contains('plus-btn')) {
                newQuantity++;
            } else {
                newQuantity = Math.max(1, newQuantity - 1);
            }
           
            updateCartItem(itemId, newQuantity, input);
        });
    });

    // Удаление товара
    document.querySelectorAll('.remove-from-cart').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            removeCartItem(this.dataset.itemId, this);
        });
    });

    // Очистка корзины
    document.querySelector('.clear-cart')?.addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Вы действительно хотите очистить корзину?')) {
            fetch(this.href, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.querySelectorAll('.cart-item').forEach(row => {
                        row.classList.add('removing');
                        setTimeout(() => row.remove(), 500);
                    });
                    updateCartCounter(0);
                    showToast('Корзина очищена');
                    document.querySelector('.cart-table')?.insertAdjacentHTML('afterend', 
                        '<div class="cart-empty-message">Корзина пуста</div>');
                }
            });
        }
    });
    
    document.querySelectorAll('.cart-item-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const itemId = this.closest('.cart-item').dataset.itemId || 
                         this.closest('[data-item-id]').getAttribute('data-item-id');
            
            fetch(`/cart/toggle-selection/${itemId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    checkSelectAllState();
                    updateCartTotals();
                    updateCheckoutLinkState();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                this.checked = !this.checked;
                updateCheckoutLinkState();
            });
        });
    });

    // Обработчик "Выбрать всё"
    document.getElementById('selectAll')?.addEventListener('change', function() {
        fetch('/cart/select-all/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `select_all=${this.checked}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.querySelectorAll('.cart-item-checkbox').forEach(checkbox => {
                    checkbox.checked = data.is_select_all;
                });
                updateCartTotals();
                updateCheckoutLinkState();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            this.checked = !this.checked;
            updateCheckoutLinkState();
        });
    });

    // Обработчик очистки корзины
    document.querySelectorAll('.cart-select-all form[action*="clear"] button').forEach(button => {
        button.addEventListener('click', function(e) {
            if (!confirm('Точно очистить корзину? Все товары будут удалены.')) {
                e.preventDefault();
            }
        });
    });

    // Обработчик клика по заблокированной ссылке
    document.addEventListener('click', function(e) {
        const checkoutLink = e.target.closest('a.checkout-btn, a[href*="checkout"]');
        if (checkoutLink && checkoutLink.classList.contains('disabled')) {
            e.preventDefault();
            e.stopPropagation();
            showToast('Выберите хотя бы один товар для оформления заказа', 'error');
        }
    });
    
    document.querySelectorAll('.wishlist-form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const form = this;
            const button = form.querySelector('button');
            const icon = button.querySelector('i');
            const productId = form.action.split('/').filter(Boolean).pop();
            
            fetch(form.action, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': form.querySelector('[name=csrfmiddlewaretoken]').value
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Меняем иконку
                    if (data.in_wishlist) {
                        icon.classList.remove('bi-heart');
                        icon.classList.add('bi-heart-fill');
                        button.title = 'Удалить из избранного';
                    } else {
                        icon.classList.remove('bi-heart-fill');
                        icon.classList.add('bi-heart');
                        button.title = 'Добавить в избранное';
                    }
                    
                    // Показываем уведомление
                    showToast(data.message, 'success');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('Ошибка при обновлении избранного', 'error');
            });
        });
    });

    // Инициализация состояния
    checkSelectAllState();
    updateCheckoutLinkState();
});
