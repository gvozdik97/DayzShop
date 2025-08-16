document.addEventListener('DOMContentLoaded', function() {
    // Обработчики для всех кнопок +/-
    document.querySelectorAll('.plus-btn, .minus-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.closest('.input-group').querySelector('.quantity-input');
            const productId = input.dataset.productId;
            let newQuantity = parseInt(input.value);
            
            if (this.classList.contains('plus-btn')) {
                newQuantity++;
            } else {
                newQuantity = Math.max(1, newQuantity - 1);
            }
            
            input.value = newQuantity;
            
            // Обновляем UI (можно добавить анимацию или другие эффекты)
            updateQuantityUI(input, newQuantity);
            
            // Если нужно сразу обновлять корзину, раскомментируйте:
            // updateCart(productId, newQuantity);
        });
    });
    
    // Валидация при ручном вводе
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            if (this.value < 1) this.value = 1;
            updateQuantityUI(this, parseInt(this.value));
        });
    });
    
    // Функция обновления UI
    function updateQuantityUI(input, newQuantity) {
        const inputGroup = input.closest('.input-group');
        const minusBtn = inputGroup.querySelector('.minus-btn');
        const plusBtn = inputGroup.querySelector('.plus-btn');
        const MAX_QUANTITY = 10; // Максимальное количество
        
        // Обновляем состояние кнопок
        if (newQuantity <= 1) {
            minusBtn.classList.add('disabled');
            minusBtn.setAttribute('disabled', 'disabled');
        } else {
            minusBtn.classList.remove('disabled');
            minusBtn.removeAttribute('disabled');
        }
        
        if (newQuantity >= MAX_QUANTITY) {
            plusBtn.classList.add('disabled');
            plusBtn.setAttribute('disabled', 'disabled');
        } else {
            plusBtn.classList.remove('disabled');
            plusBtn.removeAttribute('disabled');
        }
    }
    
    // Функция обновления корзины (примерная реализация)
    function updateCart(productId, quantity) {
        fetch(`/cart/update/${productId}/`, {
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
                // Можно добавить уведомление или обновить счетчик корзины
                console.log('Корзина обновлена');
            }
        });
    }
    
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
    
    // Инициализация UI при загрузке
    document.querySelectorAll('.quantity-input').forEach(input => {
        updateQuantityUI(input, parseInt(input.value));
    });
});