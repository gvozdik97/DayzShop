// static/js/cart.js
import { CartService } from './cart-service.js';
import { showToast, updateCartCounter, getCookie } from './utils.js';

document.addEventListener('DOMContentLoaded', function() {
    // ==================== ФУНКЦИИ КОРЗИНЫ ====================
    function updateCheckoutLinkState() {
        const checkboxes = document.querySelectorAll('.cart-item-checkbox:checked');
        const checkoutLink = document.querySelector('a.checkout-btn, a[href*="checkout"]');
        
        if (checkoutLink) {
            if (checkboxes.length === 0) {
                checkoutLink.classList.add('disabled');
                checkoutLink.style.opacity = '0.6';
                checkoutLink.style.cursor = 'not-allowed';
                checkoutLink.style.pointerEvents = 'none';
                
                if (!checkoutLink.dataset.originalHref) {
                    checkoutLink.dataset.originalHref = checkoutLink.href;
                }
                checkoutLink.removeAttribute('href');
            } else {
                checkoutLink.classList.remove('disabled');
                checkoutLink.style.opacity = '1';
                checkoutLink.style.cursor = 'pointer';
                checkoutLink.style.pointerEvents = 'auto';
                
                if (checkoutLink.dataset.originalHref) {
                    checkoutLink.href = checkoutLink.dataset.originalHref;
                }
            }
        }
    }

    function updateSavingsVisibility() {
        const savingsContainer = document.querySelector('.cart-savings');
        const selectedCount = document.querySelectorAll('.cart-item-checkbox:checked').length;
        const hasSavings = document.querySelector('.selected-items-savings').textContent.trim() !== '';
        
        if (savingsContainer) {
            if (selectedCount > 0 && hasSavings) {
                savingsContainer.style.display = 'flex';
            } else {
                savingsContainer.style.display = 'none';
            }
        }
    }

    async function updateCartTotals() {
        try {
            const response = await fetch(window.location.href, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            const data = await response.json();
            
            if (data) {
                if (document.querySelector('.selected-items-price')) {
                    document.querySelector('.selected-items-price').textContent = 
                        `${parseFloat(data.total_price_selected || 0).toLocaleString('ru-RU')} ₽`;
                }
                
                if (document.querySelector('.selected-items-count')) {
                    document.querySelector('.selected-items-count').textContent = data.selected_count;
                }
                
                if (document.querySelector('.summary-total-price')) {
                    document.querySelector('.summary-total-price').textContent = 
                        `${parseFloat(data.total_price_after_discount || 0).toLocaleString('ru-RU')} ₽`;
                }
                
                const savingsElement = document.querySelector('.selected-items-savings');
                const savingsContainer = document.querySelector('.cart-savings');

                if (savingsElement && savingsContainer) {
                    if ((Number(data.total_savings) > 0) && (Number(data.selected_count) > 0)) {
                        savingsElement.textContent = `- ${parseFloat(data.total_savings || 0).toLocaleString('ru-RU')} ₽`;
                        savingsContainer.style.display = 'flex';
                    } else {
                        savingsElement.textContent = '';
                        savingsContainer.style.display = 'none';
                    }
                }

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

    async function updateCartItem(itemId, newQuantity, input) {
        try {
            const data = await CartService.updateItem(itemId, newQuantity);
            
            if (data.success) {
                input.value = data.new_quantity;

                // Обновляем состояние кнопок
                const inputGroup = input.closest('.input-group');
                const minusBtn = inputGroup.querySelector('.minus-btn');
                const plusBtn = inputGroup.querySelector('.plus-btn');
                
                if (minusBtn) {
                    if (data.new_quantity <= 1) {
                        minusBtn.classList.add('disabled');
                        minusBtn.disabled = true;
                        minusBtn.title = 'Минимальное количество';
                    } else {
                        minusBtn.classList.remove('disabled');
                        minusBtn.disabled = false;
                        minusBtn.title = 'Уменьшить количество';
                    }
                }
                
                if (plusBtn) {
                    if (data.new_quantity >= 10) {
                        plusBtn.classList.add('disabled');
                        plusBtn.disabled = true;
                        plusBtn.title = 'Максимальное количество достигнуто';
                    } else {
                        plusBtn.classList.remove('disabled');
                        plusBtn.disabled = false;
                        plusBtn.title = 'Увеличить количество';
                    }
                }
                
                // Используем debounced обновление вместо immediate
                debouncedUpdateTotals();
                showToast('Количество обновлено');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Ошибка обновления', 'error');
            // Не перезагружаем страницу, просто показываем ошибку
        }
    }

    async function removeCartItem(itemId, button) {
        try {
            button.disabled = true;
            
            const data = await CartService.removeItem(itemId);
            
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
    // Кнопки +/-
    document.querySelectorAll('.plus-btn, .minus-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.classList.contains('disabled') || this.disabled) {
                return;
            }
            
            const input = this.closest('.input-group').querySelector('.quantity-input');
            const itemId = input.dataset.itemId;
            let newQuantity = parseInt(input.value);
           
            if (this.classList.contains('plus-btn')) {
                if (newQuantity >= 10) {
                    return;
                }
                newQuantity++;
            } else {
                if (newQuantity <= 1) {
                    return;
                }
                newQuantity = Math.max(1, newQuantity - 1);
            }
           
            updateCartItem(itemId, newQuantity, input);
        });
    });

    // Проверка ручного ввода
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            let newQuantity = parseInt(this.value) || 1;
            
            // Ограничиваем значения
            if (newQuantity < 1) newQuantity = 1;
            if (newQuantity > 10) newQuantity = 10;
            
            this.value = newQuantity;
            
            const itemId = this.dataset.itemId;
            updateCartItem(itemId, newQuantity, this);
        });
        
        // Предотвращаем ввод нечисловых значений
        input.addEventListener('keypress', function(e) {
            if (e.key < '0' || e.key > '9') {
                e.preventDefault();
            }
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
    
    // В обработчиках чекбоксов добавим timeout
    const selectionTimeout = 2000; // 2 секунды timeout
    // Добавим флаг для отслеживания состояния запросов
    let isUpdating = false;

    // Чекбоксы товаров
    document.querySelectorAll('.cart-item-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Если уже идет обновление - игнорируем новый клик
            if (isUpdating) {
                this.checked = !this.checked;
                return;
            }

            const itemId = this.closest('.cart-item').dataset.itemId;
            const wasChecked = this.checked;

            // Визуальная обратная связь
            this.disabled = true;
            isUpdating = true;

            // Добавляем timeout для запроса
            const timeoutId = setTimeout(() => {
                if (isUpdating) {
                    this.checked = !wasChecked;
                    this.disabled = false;
                    isUpdating = false;
                    showToast('Запрос выполняется слишком долго', 'error');
                }
            }, selectionTimeout);

            CartService.toggleSelection(itemId)
                .then(data => {
                    clearTimeout(timeoutId);
                    if (data.success) {
                        checkSelectAllState();
                        updateCartTotals();
                        updateCheckoutLinkState();
                        updateSavingsVisibility();
                    } else {
                        this.checked = !wasChecked; // Возвращаем если ошибка
                    }
                })
                .catch(error => {
                    clearTimeout(timeoutId);
                    console.error('Error:', error);
                    this.checked = !wasChecked; // Возвращаем при ошибке
                    updateCheckoutLinkState();
                    updateSavingsVisibility();
                })
                .finally(() => {
                    this.disabled = false;
                    isUpdating = false;
                });
        });
    });

    // "Выбрать всё"
    document.getElementById('selectAll')?.addEventListener('change', function() {
        if (isUpdating) {
            this.checked = !this.checked;
            return;
        }
        
        const wasChecked = this.checked;
        isUpdating = true;
        this.disabled = true;
        
        CartService.selectAll(this.checked)
            .then(data => {
                if (data.success) {
                    document.querySelectorAll('.cart-item-checkbox').forEach(checkbox => {
                        checkbox.checked = data.is_select_all;
                    });
                    updateCartTotals();
                    updateCheckoutLinkState();
                    updateSavingsVisibility();
                } else {
                    this.checked = !wasChecked;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                this.checked = !wasChecked;
                updateCheckoutLinkState();
                updateSavingsVisibility();
            })
            .finally(() => {
                this.disabled = false;
                isUpdating = false;
            });
    });

    // Добавим debounce для частых обновлений
    let updateTimeout;
    function debouncedUpdateTotals() {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => {
            updateCartTotals();
            updateSavingsVisibility();
        }, 300);
    }

    // Обработчик клика по заблокированной ссылке
    document.addEventListener('click', function(e) {
        const checkoutLink = e.target.closest('a.checkout-btn, a[href*="checkout"]');
        if (checkoutLink && checkoutLink.classList.contains('disabled')) {
            e.preventDefault();
            e.stopPropagation();
            showToast('Выберите хотя бы один товар для оформления заказа', 'error');
        }
    });

    // Инициализация состояния
    checkSelectAllState();
    updateCheckoutLinkState();
});