// static/js/wishlist-ui.js
import { WishlistService } from './wishlist-service.js';
import { showToast } from './utils.js';

export class WishlistUI {
    static isProcessing = new Set();

    static updateButtonState(button, inWishlist) {
        const icon = button.querySelector('[data-lucide="heart"]');
        if (!icon) return;
        
        if (inWishlist) {
            icon.setAttribute('fill', 'currentColor');
            button.title = 'Удалить из избранного';
            button.dataset.inWishlist = 'true';
            button.classList.add('active');
        } else {
            icon.removeAttribute('fill');
            button.title = 'Добавить в избранное';
            delete button.dataset.inWishlist;
            button.classList.remove('active');
        }
        
        // Анимация
        // icon.style.transform = 'scale(1.3)';
        // setTimeout(() => {
        //     icon.style.transform = 'scale(1)';
        // }, 200);
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    static updateAllWishlistButtons(productId, inWishlist) {
        const allButtons = document.querySelectorAll(`.favorite-btn[data-product-id="${productId}"]`);
        
        allButtons.forEach(btn => {
            this.updateButtonState(btn, inWishlist);
        });
    }

    static async handleWishlistToggle(button) {
        const productId = button.dataset.productId;
        
        if (!productId) {
            console.error('Product ID not found in button dataset');
            return;
        }
        
        // Проверяем, не обрабатывается ли уже этот товар
        if (this.isProcessing.has(productId)) {
            return;
        }
        
        // Проверка авторизации
        const isAuthenticated = document.body.dataset.userAuthenticated === 'true';
        if (!isAuthenticated) {
            this.showLoginModal();
            return;
        }
        
        try {
            this.isProcessing.add(productId);
            
            const result = await WishlistService.toggleWishlist(productId);
            
            if (result.success) {
                this.updateAllWishlistButtons(productId, result.in_wishlist);
                showToast(result.message || 'Избранное обновлено');
                
                // Отправляем событие для синхронизации
                const event = new CustomEvent('wishlistItemToggled', {
                    detail: { productId, inWishlist: result.in_wishlist }
                });
                document.dispatchEvent(event);
            } else {
                throw new Error(result.error || 'Ошибка обновления избранного');
            }
        } catch (error) {
            console.error('Wishlist toggle error:', error);
            showToast(error.message || 'Ошибка при обновлении избранного', 'error');
        } finally {
            this.isProcessing.delete(productId);
        }
    }

    static showLoginModal() {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            const modal = new bootstrap.Modal(loginModal);
            modal.show();
        } else {
            showToast('Пожалуйста, войдите в систему чтобы добавить в избранное', 'error');
        }
    }

    static initWishlistButtons() {
        document.body.addEventListener('click', (e) => {
            const button = e.target.closest('.favorite-btn');
            if (!button) return;
            
            e.preventDefault();
            e.stopPropagation();
            this.handleWishlistToggle(button);
        });

        // Синхронизация при событиях
        document.addEventListener('wishlistItemToggled', (e) => {
            this.updateAllWishlistButtons(e.detail.productId, e.detail.inWishlist);
        });
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    WishlistUI.initWishlistButtons();
});