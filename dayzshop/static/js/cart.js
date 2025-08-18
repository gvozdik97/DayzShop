// static/js/cart.js
document.addEventListener('DOMContentLoaded', function() {
    // ==================== АНИМАЦИЯ НАЗВАНИЙ ТОВАРОВ ====================
    function initMarqueeTitles() {
        document.querySelectorAll('.product-name').forEach(function(el) {
            const container = el.parentElement;
            const textWidth = el.scrollWidth;
            const containerWidth = container.offsetWidth;
            
            if (textWidth > containerWidth) {
                el.classList.add('marquee');
                
                // Создаем клон для плавной анимации
                const clone = el.cloneNode(true);
                clone.classList.add('marquee-clone');
                container.appendChild(clone);
            }
        });
    }

    initMarqueeTitles();

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
                html: '<i class="bi bi-cart-plus"></i> В корзину',
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
        fetch(`/cart/update/${itemId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: `quantity=${newQuantity}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                input.value = data.new_quantity;
                // Обновляем отображение суммы
                const totalElement = input.closest('tr').querySelector('.item-total');
                if (totalElement) {
                    totalElement.textContent = `${data.item_total} руб.`;
                    totalElement.classList.add('item-updated');
                    setTimeout(() => totalElement.classList.remove('item-updated'), 1000);
                }
                // Обновляем общую сумму
                document.querySelector('.cart-total').textContent = `${data.cart_total} руб.`;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            location.reload(); // Перезагрузка при ошибке
        });
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
});
