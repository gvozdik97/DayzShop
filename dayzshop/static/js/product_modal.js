document.addEventListener('DOMContentLoaded', function() {
    const productModal = document.getElementById('productModal');
    
    productModal.addEventListener('show.bs.modal', function(event) {
        const button = event.relatedTarget;
        const productId = button.getAttribute('data-product-id');
        const modalBody = document.getElementById('productModalBody');
        const modalTitle = document.getElementById('productModalLabel');
        
        console.log('Product ID:', productId);
        console.log('Modal elements:', { 
            body: modalBody, 
            title: modalTitle,
            button: button
        });
        
        // Показываем загрузку
        modalBody.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-warning" role="status">
                    <span class="visually-hidden">Загрузка...</span>
                </div>
            </div>`;
        
        // Загружаем данные
        console.log(`Fetching: /products/${productId}/modal/`);
        fetch(`/products/${productId}/modal/`)
            .then(async response => {
                console.log('Response status:', response.status); // Статус ответа
                console.log('Headers:', [...response.headers.entries()]); // Все заголовки
                const contentType = response.headers.get('content-type');
                if (!response.ok) {
                    const error = contentType?.includes('application/json') 
                        ? (await response.json()).error 
                        : await response.text();
                    throw new Error(error || 'Ошибка сервера');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    modalBody.innerHTML = data.html;
                    modalTitle.textContent = data.product_name;
                    initModalHandlers(productId);
                } else {
                    showModalError(modalBody, data.error);
                }
            })
            .catch(error => {
                showModalError(modalBody, error.message);
            });
    });
    
    function showModalError(container, message) {
        container.innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle"></i>
                ${message}
                <button class="btn btn-sm btn-outline-secondary mt-2" 
                        onclick="location.reload()">
                    Обновить страницу
                </button>
            </div>`;
    }
    
    function initModalHandlers(productId) {
        // Инициализация кнопок +/- и добавления в корзину
        const quantityInput = document.querySelector('#productModal .quantity-input');
        
        if (quantityInput) {
            document.querySelector('#productModal .plus-btn').addEventListener('click', () => {
                quantityInput.value = parseInt(quantityInput.value) + 1;
            });
            
            document.querySelector('#productModal .minus-btn').addEventListener('click', () => {
                if (quantityInput.value > 1) quantityInput.value -= 1;
            });
            
            document.querySelector('#productModal .add-to-cart-btn').addEventListener('click', () => {
                addToCart(productId, quantityInput.value);
            });
        }
    }
    
    function addToCart(productId, quantity) {
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
                updateCartCounter(data.cart_total_items);
                showToast('Товар добавлен в корзину');
            }
        });
    }
    
    // function getCookie(name) {
    //     const cookies = document.cookie.split(';');
    //     for (let cookie of cookies) {
    //         const [key, value] = cookie.trim().split('=');
    //         if (key === name) return decodeURIComponent(value);
    //     }
    //     return null;
    // }
});