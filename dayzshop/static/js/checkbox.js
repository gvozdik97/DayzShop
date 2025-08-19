document.addEventListener('DOMContentLoaded', function() {
    async function updateCartTotals() {
        try {
            const response = await fetch(window.location.href, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            const data = await response.json();
            
            if (data) {
                // Обновляем сумму выбранных товаров (без скидки)
                if (document.querySelector('.selected-items-price')) {
                    document.querySelector('.selected-items-price').textContent = 
                        `${parseFloat(data.total_price_selected || 0).toLocaleString('ru-RU')} ₽`;
                }
                
                // Обновляем счетчик выбранных товаров
                if (document.querySelector('.selected-items-count')) {
                    document.querySelector('.selected-items-count').textContent = data.selected_count;
                }
                
                // Обновляем итоговую сумму (со скидкой)
                if (document.querySelector('.cart-total-price')) {
                    document.querySelector('.cart-total-price').textContent = 
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
                
                // Обновляем чекбокс "Выбрать всё"
                const selectAll = document.getElementById('selectAll');
                if (selectAll) {
                    selectAll.checked = data.all_selected;
                }
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
    }

    // Обработчик выбора отдельного товара
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
                }
            })
            .catch(error => {
                console.error('Error:', error);
                this.checked = !this.checked;
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
            }
        })
        .catch(error => {
            console.error('Error:', error);
            this.checked = !this.checked;
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

    // Инициализация состояния
    checkSelectAllState();
});
