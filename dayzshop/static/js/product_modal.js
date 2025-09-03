// static/js/product_modal.js
import { CartUI } from './cart-ui.js';
import { WishlistUI } from './wishlist-ui.js';
import { showToast, getCookie } from './utils.js';

document.addEventListener('DOMContentLoaded', function() {
    const productModal = document.getElementById('productModal');
    if (!productModal) return;
    
    let currentProductId = null;
    let currentProductData = null;
    
    productModal.addEventListener('show.bs.modal', function(event) {
        const button = event.relatedTarget;
        currentProductId = button.getAttribute('data-product-id');
        
        if (!currentProductId) {
            console.error('Product ID not found');
            return;
        }
        
        // Проверяем, есть ли товар уже в корзине
        const isInCart = document.querySelector(`.add-to-cart-btn[data-product-id="${currentProductId}"][data-is-in-cart="true"]`) !== null;
        
        const modalBody = document.getElementById('productModalBody');
        // const favoriteBtn = document.getElementById('modalFavoriteBtn');
        
        // if (favoriteBtn) {
        //     favoriteBtn.setAttribute('data-product-id', currentProductId);
        // }
        
        modalBody.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-warning" role="status">
                    <span class="visually-hidden">Загрузка...</span>
                </div>
            </div>`;
        
        fetch(`/products/${currentProductId}/modal/`)
            .then(async response => {
                if (!response.ok) throw new Error('Ошибка сервера');
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    currentProductData = data;
                    modalBody.innerHTML = data.html;

                    if (typeof WishlistUI !== 'undefined') {
                        // Обновить состояние кнопки согласно текущим данным
                        const modalFavoriteBtn = modalBody.querySelector('.favorite-btn');
                        if (modalFavoriteBtn && currentProductData) {
                            WishlistUI.updateButtonState(modalFavoriteBtn, currentProductData.in_wishlist);
                        }
                    }
                    
                    // Устанавливаем правильное состояние кнопки корзины
                    const modalAddToCartBtn = document.getElementById('modalAddToCartBtn');
                    if (modalAddToCartBtn) {
                        modalAddToCartBtn.dataset.productId = currentProductId;
                        // Проверяем, есть ли товар уже в корзине
                        const isInCart = document.querySelector(`.add-to-cart-btn[data-product-id="${currentProductId}"][data-is-in-cart="true"]`) !== null;
                        if (isInCart) {
                            CartUI.setButtonState(modalAddToCartBtn, 'added');
                        }
                    }
                    
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }
                } else {
                    showModalError(modalBody, data.error || 'Ошибка загрузки данных');
                }
            })
            .catch(error => {
                console.error('Fetch error:', error);
                showModalError(modalBody, error.message);
            });
    });

    // После загрузки контента модального окна
    modalBody.addEventListener('click', function(e) {
        const favoriteBtn = e.target.closest('.favorite-btn');
        if (favoriteBtn) {
            e.preventDefault();
            WishlistUI.handleWishlistToggle(favoriteBtn);
        }
    });
    
    // function updateFavoriteButton(button, isFavorite) {
    //     if (!button) return;
        
    //     const icon = button.querySelector('i');
    //     if (!icon) return;
        
    //     if (isFavorite) {
    //         icon.setAttribute('fill', 'currentColor');
    //         button.setAttribute('title', 'Удалить из избранного');
    //         button.classList.add('active');
    //         button.dataset.inWishlist = 'true';
    //     } else {
    //         icon.removeAttribute('fill');
    //         button.setAttribute('title', 'Добавить в избранное');
    //         button.classList.remove('active');
    //         button.removeAttribute('data-in-wishlist');
    //     }
    // }
    
    // function toggleFavoriteFromModal(button) {
    //     const productId = button.getAttribute('data-product-id');
        
    //     if (!productId) {
    //         showToast('Не удалось определить товар', 'error');
    //         return;
    //     }
        
    //     // Проверяем авторизацию
    //     if (!isUserAuthenticated()) {
    //         showToast('Для добавления в избранное необходимо авторизоваться', 'error');
    //         return;
    //     }
        
    //     // Показываем loading state
    //     const originalHtml = button.innerHTML;
    //     button.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
    //     button.disabled = true;
        
    //     // Получаем CSRF токен
    //     const csrfToken = getCookie('csrftoken');
    //     if (!csrfToken) {
    //         showToast('Ошибка безопасности. Перезагрузите страницу.', 'error');
    //         button.innerHTML = originalHtml;
    //         button.disabled = false;
    //         return;
    //     }
        
    //     fetch(`/shop/toggle_wishlist/${productId}/`, {
    //         method: 'POST',
    //         headers: {
    //             'X-CSRFToken': csrfToken,
    //             'X-Requested-With': 'XMLHttpRequest',
    //             'Content-Type': 'application/json',
    //         },
    //         credentials: 'same-origin'
    //     })
    //     .then(async response => {
    //         const data = await response.json();
    //         if (!response.ok) {
    //             throw new Error(data.error || `HTTP error! status: ${response.status}`);
    //         }
    //         return data;
    //     })
    //     .then(data => {
    //         if (data.success) {
    //             // Обновляем состояние кнопки
    //             updateFavoriteButton(button, data.in_wishlist);
    //             showToast(data.message || 'Избранное обновлено');
    //         } else {
    //             throw new Error(data.error || 'Ошибка обновления избранного');
    //         }
    //     })
    //     .catch(error => {
    //         console.error('Error details:', error);
    //         showToast(error.message || 'Ошибка при обновлении избранного', 'error');
    //     })
    //     .finally(() => {
    //         // Восстанавливаем кнопку
    //         button.innerHTML = originalHtml;
    //         button.disabled = false;
            
    //         // Инициализируем иконки
    //         if (typeof lucide !== 'undefined') {
    //             lucide.createIcons();
    //         }
    //     });
    // }
    
    // function isUserAuthenticated() {
    //     const metaAuth = document.querySelector('meta[name="user-authenticated"]');
    //     if (metaAuth) {
    //         return metaAuth.getAttribute('content') === 'true';
    //     }
    //     return !!getCookie('csrftoken');
    // }
    
    function showModalError(container, message) {
        if (!container) return;
        
        container.innerHTML = `
            <div class="alert alert-danger m-0">
                <i class="bi bi-exclamation-triangle"></i>
                ${message}
                <button class="btn btn-sm btn-outline-secondary mt-2" 
                        onclick="location.reload()">
                    Обновить страницу
                </button>
            </div>`;
    }
});