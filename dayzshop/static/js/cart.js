// static/js/cart.js
document.addEventListener('DOMContentLoaded', function() {
    // Функция для получения CSRF токена
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Обновление счетчика в шапке
    function updateCartCounter(count) {
        const counter = document.querySelector('.cart-counter');
        if (counter) {
            counter.textContent = count;
            counter.classList.toggle('d-none', count <= 0);
        }
    }

    // Блокировка кнопки "В корзину"
    function disableAddButton(productId) {
        const buttons = document.querySelectorAll(`.add-to-cart-btn[data-product-id="${productId}"]`);
        buttons.forEach(btn => {
            btn.innerHTML = '<i class="bi bi-check"></i> В корзине';
            btn.classList.add('disabled', 'btn-success');
            btn.classList.remove('btn-warning');
        });
    }

    // Разблокировка кнопки "В корзину"
    function enableAddButton(productId) {
        const buttons = document.querySelectorAll(`.add-to-cart-btn[data-product-id="${productId}"]`);
        buttons.forEach(btn => {
            btn.innerHTML = '<i class="bi bi-cart-plus"></i> В корзину';
            btn.classList.remove('disabled', 'btn-success');
            btn.classList.add('btn-warning');
        });
    }

    // Обработка кнопок +/-
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            if (this.value < 1) this.value = 1;
        });
    });

    document.querySelectorAll('.plus-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('.quantity-input');
            input.value = parseInt(input.value) + 1;
        });
    });

    document.querySelectorAll('.minus-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('.quantity-input');
            if (input.value > 1) input.value = parseInt(input.value) - 1;
        });
    });

    // Добавление в корзину
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        if (!btn.classList.contains('disabled')) {
            btn.addEventListener('click', function() {
                const productId = this.dataset.productId;
                const quantity = parseInt(this.closest('.quantity-group')
                                      .querySelector('.quantity-input').value);
                
                fetch(`/cart/add/${productId}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: `quantity=${quantity}`
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        disableAddButton(productId);
                        updateCartCounter(data.cart_total_items);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    this.textContent = 'Ошибка';
                });
            });
        }
    });

    // Удаление из корзины
    document.querySelectorAll('.remove-from-cart').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const itemId = this.dataset.itemId;
            
            fetch(this.href, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': getCookie('csrftoken')
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.closest('tr').remove();
                    updateCartCounter(data.cart_total_items);
                    
                    // Если корзина пуста, покажем сообщение
                    if (data.cart_total_items === 0) {
                        document.querySelector('table').insertAdjacentHTML('afterend', 
                            '<div class="alert alert-info">Корзина пуста</div>');
                    }
                    
                    // Разблокируем кнопку "В корзину"
                    if (data.product_id) {
                        enableAddButton(data.product_id);
                    }
                }
            });
        });
    });
});