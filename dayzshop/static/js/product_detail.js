document.addEventListener('DOMContentLoaded', function() {
    // Обработка кнопок +/-
    const quantityInput = document.getElementById('quantity');
    document.querySelector('.plus-btn').addEventListener('click', function() {
        quantityInput.value = parseInt(quantityInput.value) + 1;
    });
    document.querySelector('.minus-btn').addEventListener('click', function() {
        if (quantityInput.value > 1) {
            quantityInput.value = parseInt(quantityInput.value) - 1;
        }
    });

    // AJAX добавление в корзину
    const form = document.getElementById('add-to-cart-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            fetch(form.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': form.querySelector('[name=csrfmiddlewaretoken]').value
                },
                body: `quantity=${quantityInput.value}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Обновляем счетчик в шапке
                    const counter = document.querySelector('.cart-counter');
                    if (counter) {
                        counter.textContent = data.cart_total_items;
                        counter.classList.remove('d-none');
                    }
                    
                    // Анимация успешного добавления
                    const btn = form.querySelector('button[type=submit]');
                    btn.innerHTML = '<i class="bi bi-check"></i> Добавлено';
                    btn.classList.remove('btn-warning');
                    btn.classList.add('btn-success');
                    
                    setTimeout(() => {
                        btn.innerHTML = '<i class="bi bi-cart-plus"></i> В корзину';
                        btn.classList.add('btn-warning');
                        btn.classList.remove('btn-success');
                    }, 2000);
                }
            });
        });
    }
});