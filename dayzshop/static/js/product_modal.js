// document.addEventListener('DOMContentLoaded', function() {
//     const productModal = document.getElementById('productModal');
    
//     if (!productModal) return; // Если модального окна нет на странице
    
//     // Обработчик открытия модалки
//     productModal.addEventListener('show.bs.modal', function(event) {
//         const button = event.relatedTarget;
//         const productId = button.getAttribute('data-product-id');
//         const modalBody = document.getElementById('productModalBody');
        
//         // Показываем спиннер загрузки
//         modalBody.innerHTML = `
//             <div class="text-center py-5">
//                 <div class="spinner-border text-warning" role="status">
//                     <span class="visually-hidden">Загрузка...</span>
//                 </div>
//             </div>`;
        
//         // Загружаем контент
//         fetch(`/products/${productId}/modal/`)
//             .then(response => {
//                 if (!response.ok) throw new Error('Ошибка загрузки');
//                 return response.text();
//             })
//             .then(html => {
//                 modalBody.innerHTML = html;
                
//                 // Инициализируем обработчики внутри модалки
//                 initModalHandlers(productId);
//             })
//             .catch(error => {
//                 modalBody.innerHTML = `
//                     <div class="alert alert-danger">
//                         Ошибка загрузки данных: ${error.message}
//                         <button class="btn btn-sm btn-outline-secondary mt-2" 
//                                 onclick="location.reload()">Обновить</button>
//                     </div>`;
//             });
//     });
    
//     // Очистка при закрытии
//     productModal.addEventListener('hidden.bs.modal', function() {
//         document.getElementById('productModalBody').innerHTML = '';
//     });
// });

// // Отдельная функция для инициализации обработчиков внутри модалки
// function initModalHandlers(productId) {
//     // Обработчик кнопок +/-
//     const quantityInput = document.querySelector('#productModal .quantity-input');
//     if (quantityInput) {
//         document.querySelector('#productModal .plus-btn').addEventListener('click', () => {
//             quantityInput.value = parseInt(quantityInput.value) + 1;
//         });
        
//         document.querySelector('#productModal .minus-btn').addEventListener('click', () => {
//             if (quantityInput.value > 1) {
//                 quantityInput.value = parseInt(quantityInput.value) - 1;
//             }
//         });
//     }
    
//     // Обработчик добавления в корзину
//     const addToCartBtn = document.querySelector('#productModal .add-to-cart-btn');
//     if (addToCartBtn) {
//         addToCartBtn.addEventListener('click', function() {
//             const quantity = parseInt(quantityInput.value) || 1;
            
//             fetch(`/cart/add/${productId}/`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/x-www-form-urlencoded',
//                     'X-CSRFToken': getCookie('csrftoken')
//                 },
//                 body: `quantity=${quantity}`
//             })
//             .then(response => response.json())
//             .then(data => {
//                 if (data.success) {
//                     // Обновляем кнопку
//                     addToCartBtn.innerHTML = '<i class="bi bi-check-circle"></i> В корзине';
//                     addToCartBtn.classList.add('disabled', 'btn-success');
//                     addToCartBtn.classList.remove('btn-warning');
                    
//                     // Обновляем счетчик в шапке
//                     updateCartCounter(data.cart_total_items);
//                 }
//             });
//         });
//     }
// }

// // Вспомогательные функции
// function getCookie(name) {
//     // ... (реализация из предыдущего кода)
// }

// function updateCartCounter(count) {
//     const counter = document.querySelector('.cart-counter');
//     if (counter) {
//         counter.textContent = count;
//         counter.classList.toggle('d-none', count <= 0);
//     }
// }
document.addEventListener('DOMContentLoaded', function() {
    const productModal = document.getElementById('productModal');
    
    productModal.addEventListener('show.bs.modal', function(event) {
        const button = event.relatedTarget;
        const productId = button.getAttribute('data-product-id');
        const modalBody = document.getElementById('productModalBody');
        const modalTitle = document.getElementById('productModalLabel');
        
        // Показываем загрузку
        modalBody.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-warning" role="status">
                    <span class="visually-hidden">Загрузка...</span>
                </div>
            </div>`;
        
        // Загружаем данные
        fetch(`/products/${productId}/modal/`)
            .then(response => {
                if (!response.ok) throw new Error('Ошибка сервера');
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    modalBody.innerHTML = data.html;
                    modalTitle.textContent = data.product_name;
                    initModalHandlers(productId);
                } else {
                    showModalError(modalBody, data.error || 'Неизвестная ошибка');
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
    
    // Вспомогательные функции...
});