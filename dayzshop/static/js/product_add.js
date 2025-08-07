// static/js/product_add.js
document.addEventListener('DOMContentLoaded', function() {
    // Обработка кнопок +/-
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

    // Обработка добавления в корзину
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.productId;
            const quantity = this.closest('.card-footer')
                              .querySelector('.quantity-input').value;
            
            addToCart(productId, quantity, this);
        });
    });

    function addToCart(productId, quantity, button) {
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
                // Анимация успешного добавления
                button.innerHTML = '<i class="bi bi-check"></i> Добавлено';
                button.classList.remove('btn-warning');
                button.classList.add('btn-success');
                
                // Обновляем счетчик корзины в шапке
                if (data.cart_total_items > 0) {
                    document.querySelector('.cart-counter').textContent = data.cart_total_items;
                    document.querySelector('.cart-counter').classList.remove('d-none');
                }
                
                // Возвращаем исходный вид через 2 секунды
                setTimeout(() => {
                    button.innerHTML = '<i class="bi bi-cart-plus"></i>';
                    button.classList.add('btn-warning');
                    button.classList.remove('btn-success');
                }, 2000);
            }
        })
        .then(data => {
            if (data.success && data.in_cart) {
                updateAddToCartButtons(productId);
            }
        })
        
        .catch(error => {
            console.error('Error:', error);
            button.textContent = 'Ошибка';
        });
    }

    function updateAddToCartButtons(productId) {
        const buttons = document.querySelectorAll(`.add-to-cart-btn[data-product-id="${productId}"]`);
        buttons.forEach(btn => {
            btn.innerHTML = '<i class="bi bi-check"></i> В корзине';
            btn.classList.add('disabled');
            btn.classList.remove('btn-warning');
            btn.classList.add('btn-success');
        });
    }

    // Функция для получения CSRF токена
    function getCookie(name) {
        // ... (та же реализация, что и в предыдущем примере)
    }
});
