// static/js/wishlist.js
import { getCookie, showToast } from './utils.js';

document.addEventListener('DOMContentLoaded', function() {
    // Обработка избранного на карточках товаров
    document.addEventListener('click', function(e) {
        const favoriteBtn = e.target.closest('.favorite-btn');
        if (!favoriteBtn) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const form = favoriteBtn.closest('.wishlist-form');
        if (!form) return;
        
        if (!document.body.dataset.userAuthenticated || document.body.dataset.userAuthenticated === 'false') {
            showLoginModal();
            return;
        }
        
        const button = favoriteBtn;
        const icon = button.querySelector('[data-lucide="heart"]');
        const productId = form.action.split('/').filter(Boolean).pop();
        
        button.disabled = true;
        
        fetch(form.action, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateWishlistIcon(icon, data.in_wishlist);
                
                button.title = data.in_wishlist ? 'Удалить из избранного' : 'Добавить в избранное';
                if (data.in_wishlist) {
                    button.dataset.inWishlist = 'true';
                } else {
                    delete button.dataset.inWishlist;
                }
                
                showToast(data.message, 'success');
                animateHeart(icon);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Ошибка при обновлении избранного', 'error');
        })
        .finally(() => {
            button.disabled = false;
        });
    });

    function updateWishlistIcon(icon, isInWishlist) {
        const parent = icon.parentElement;
        icon.remove();
        
        const newIcon = document.createElement('i');
        newIcon.setAttribute('data-lucide', 'heart');
        newIcon.classList.add('lucide-icon-sm');
        
        if (isInWishlist) {
            newIcon.classList.add('currentColor');
            newIcon.setAttribute('fill', 'currentColor');
        }
        
        parent.appendChild(newIcon);
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    function animateHeart(icon) {
        icon.style.transform = 'scale(1.3)';
        setTimeout(() => {
            icon.style.transform = 'scale(1)';
        }, 200);
    }

    function showLoginModal() {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            const modal = new bootstrap.Modal(loginModal);
            modal.show();
        } else {
            showToast('Пожалуйста, войдите в систему чтобы добавить в избранное', 'error');
        }
    }

    // Обработка удаления из избранного
    document.querySelectorAll('.wishlist-remove-form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const button = this.querySelector('button');
            const originalHtml = button.innerHTML;
            
            button.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
            button.disabled = true;
            
            fetch(this.action, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': this.querySelector('[name=csrfmiddlewaretoken]').value,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const card = this.closest('.col');
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    card.style.transition = 'all 0.3s ease';
                    
                    setTimeout(() => {
                        card.remove();
                        updateWishlistCounter();
                        
                        const remainingItems = document.querySelectorAll('.wishlist-remove-form').length;
                        
                        if (remainingItems === 0) {
                            // Переключаем видимость блоков
                            document.getElementById('wishlistContent').style.display = 'none';
                            document.getElementById('wishlistEmptyState').style.display = 'block';
                        }
                    }, 300);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                button.innerHTML = originalHtml;
                button.disabled = false;
                showToast('Ошибка при удалении', 'error');
            });
        });
    });

    function updateWishlistCounter() {
        const counterElement = document.querySelector('.wishlish-counter-text');
        if (counterElement) {
            const currentText = counterElement.textContent;
            const currentCount = parseInt(currentText.match(/\d+/)[0]);
            const newCount = currentCount - 1;
            
            let wordForm;
            if (newCount === 1) wordForm = 'желанный предмет';
            else if (newCount >= 2 && newCount <= 4) wordForm = 'желанных предмета';
            else wordForm = 'желанных предметов';
            
            counterElement.innerHTML = `
                <span class="counter-number">${newCount}</span>
                <span class="counter-label">${wordForm}</span>
            `;
        }
    }
});