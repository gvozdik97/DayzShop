// static/js/wishlist.js
import { WishlistUI } from './wishlist-ui.js';

document.addEventListener('DOMContentLoaded', function() {
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