document.addEventListener('DOMContentLoaded', function() {
    function updateSelectedItemsPrice() {
        fetch('/cart/detail/', {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.total_selected_price) {
                document.querySelector('.cart-summary .h4.fw-bold').textContent = 
                    `${data.total_selected_price} ₽`;
            }
        });
    }

    function checkSelectAllState() {
        const checkboxes = document.querySelectorAll('.cart-item-checkbox:checked');
        const selectAll = document.getElementById('selectAll');
        selectAll.checked = checkboxes.length === document.querySelectorAll('.cart-item-checkbox').length;
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
                    // Проверяем состояние "Выбрать всё"
                    checkSelectAllState();
                    updateSelectedItemsPrice();
                }
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
                updateSelectedItemsPrice();
            }
        });
    });

    checkSelectAllState();
});