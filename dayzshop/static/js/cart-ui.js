// static/js/cart-ui.js
import { CartService } from './cart-service.js';
import { showToast, updateCartCounter } from './utils.js';

export class CartUI {
    static setButtonState(button, state) {
        const states = {
            loading: {
                html: '<span class="spinner"></span> Добавляем...',
                class: 'loading',
                disabled: true
            },
            added: {
                html: '<i class="bi bi-check-circle-fill"></i> В корзине',
                class: 'added-to-cart',
                disabled: false
            },
            default: {
                html: '<i class="bi bi-cart2"></i> В корзину',
                class: '',
                disabled: false
            },
            error: {
                html: '<i class="bi bi-exclamation-triangle"></i> Ошибка',
                class: 'error',
                disabled: false
            }
        };
        
        const config = states[state] || states.default;
        
        button.innerHTML = config.html;
        button.className = `btn add-to-cart-btn ${config.class}`;
        button.disabled = config.disabled;

        if (state === 'added') {
            button.dataset.isInCart = 'true';
        } else {
            button.removeAttribute('data-is-in-cart');
        }
    }

    static initCartStateSync() {
        // Слушаем custom events для синхронизации состояния
        document.addEventListener('cartItemAdded', function(e) {
            CartUI.updateAllProductButtons(e.detail.productId, true);
        });
        
        document.addEventListener('cartItemRemoved', function(e) {
            CartUI.updateAllProductButtons(e.detail.productId, false);
        });
    }

    static isProcessing = new Set();

    static async handleAddToCart(button) {
        const productId = button.dataset.productId;
        
        // Проверяем, не обрабатывается ли уже этот товар
        if (this.isProcessing.has(productId)) {
            console.log('Product is already being processed:', productId);
            return;
        }
        
        // Если кнопка уже в состоянии "В корзине" - переход в корзину
        if (button.dataset.isInCart === 'true' || button.classList.contains('added-to-cart')) {
            const cartUrlElement = document.getElementById('cart-data');
            if (cartUrlElement && cartUrlElement.dataset.cartUrl) {
                window.location.href = cartUrlElement.dataset.cartUrl;
            } else {
                window.location.href = '/cart/';
            }
            return;
        }
        
        if (!productId) {
            console.error('Product ID not found in button dataset');
            return;
        }
        
        try {
            // Добавляем в множество обрабатываемых товаров
            this.isProcessing.add(productId);
            this.setButtonState(button, 'loading');
            
            const result = await CartService.addToCart(productId);
            
            if (result.success) {
                this.setButtonState(button, 'added');
                updateCartCounter(result.cart_count);
                showToast('Товар добавлен в корзину');
                
                // Обновляем все кнопки этого товара на странице
                this.updateAllProductButtons(productId, true);
                
                // Отправляем событие о добавлении товара
                const event = new CustomEvent('cartItemAdded', { 
                    detail: { productId: productId } 
                });
                document.dispatchEvent(event);
            } else {
                throw new Error(result.error || 'Ошибка добавления');
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            this.setButtonState(button, 'error');
            showToast('Ошибка добавления в корзину', 'error');
            
            setTimeout(() => {
                if (!button.dataset.isInCart) {
                    this.setButtonState(button, 'default');
                }
            }, 2000);
        } finally {
            // Удаляем из множества обрабатываемых товаров
            this.isProcessing.delete(productId);
        }
    }

    static updateAllProductButtons(productId, isInCart) {
        // Обновляем все кнопки этого товара на странице
        const allButtons = document.querySelectorAll(`.add-to-cart-btn[data-product-id="${productId}"]`);
        allButtons.forEach(btn => {
            this.setButtonState(btn, isInCart ? 'added' : 'default');
        });
        
        // Также обновляем кнопку в модальном окне, если она существует
        const modalButton = document.getElementById('modalAddToCartBtn');
        if (modalButton && modalButton.dataset.productId === productId) {
            this.setButtonState(modalButton, isInCart ? 'added' : 'default');
        }
    }

    static initCartButtons() {
        document.body.addEventListener('click', (e) => {
            const button = e.target.closest('.add-to-cart-btn');
            if (!button) return;
            
            e.preventDefault();
            this.handleAddToCart(button);
        });
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    CartUI.initCartButtons();
});