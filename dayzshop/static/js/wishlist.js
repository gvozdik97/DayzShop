// static/js/wishlist.js
document.addEventListener('DOMContentLoaded', function() {
    // Обработка избранного на карточках товаров
    document.addEventListener('click', function(e) {
        const favoriteBtn = e.target.closest('.favorite-btn');
        if (!favoriteBtn) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const form = favoriteBtn.closest('.wishlist-form');
        if (!form) return;
        
        // Проверяем авторизацию
        if (!document.body.dataset.userAuthenticated || document.body.dataset.userAuthenticated === 'false') {
            showLoginModal();
            return;
        }
        
        const button = favoriteBtn;
        const icon = button.querySelector('[data-lucide="heart"]');
        const productId = form.action.split('/').filter(Boolean).pop();
        
        // Показываем лоадер
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
                // Обновляем иконку Lucide
                updateWishlistIcon(icon, data.in_wishlist);
                
                // Обновляем title и data-атрибут
                button.title = data.in_wishlist ? 'Удалить из избранного' : 'Добавить в избранное';
                if (data.in_wishlist) {
                    button.dataset.inWishlist = 'true';
                } else {
                    delete button.dataset.inWishlist;
                }
                
                // Показываем уведомление
                showToast(data.message, 'success');
                
                // Анимация
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

    // Функция обновления иконки Lucide
    function updateWishlistIcon(icon, isInWishlist) {
        // Удаляем старую иконку
        const parent = icon.parentElement;
        icon.remove();
        
        // Создаем новую иконку
        const newIcon = document.createElement('i');
        newIcon.setAttribute('data-lucide', 'heart');
        newIcon.classList.add('lucide-icon-sm');
        
        if (isInWishlist) {
            newIcon.classList.add('currentColor');
            newIcon.setAttribute('fill', 'currentColor');
        }
        
        parent.appendChild(newIcon);
        
        // Переинициализируем Lucide
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // Анимация сердечка
    function animateHeart(icon) {
        icon.style.transform = 'scale(1.3)';
        setTimeout(() => {
            icon.style.transform = 'scale(1)';
        }, 200);
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

    // Функция показа уведомлений
    function showToast(message, type = 'success') {
        // Используем существующую функцию из cart.js или создаем свою
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        } else {
            // Простая реализация
            const toast = document.createElement('div');
            toast.className = `toast-notification ${type}`;
            toast.innerHTML = `
                <i class="bi ${type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'}"></i>
                <span>${message}</span>
            `;
            document.body.appendChild(toast);
            
            setTimeout(() => toast.classList.add('show'), 10);
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    }

    // Функция показа модального окна авторизации
    function showLoginModal() {
        // Используем существующую модалку или показываем сообщение
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            const modal = new bootstrap.Modal(loginModal);
            modal.show();
        } else {
            showToast('Пожалуйста, войдите в систему чтобы добавить в избранное', 'error');
        }
    }

    document.querySelectorAll('.wishlist-remove-form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const button = this.querySelector('button');
            const originalHtml = button.innerHTML;
            
            // Показываем лоадер
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
                    // Удаляем карточку с анимацией
                    const card = this.closest('.col');
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    card.style.transition = 'all 0.3s ease';
                    
                    setTimeout(() => {
                        card.remove();
                        
                        // Обновляем счетчик в заголовке
                        const countElement = document.querySelector('.wishlist-header .text-muted');
                        if (countElement) {
                            const currentCount = parseInt(countElement.textContent.match(/\d+/)[0]);
                            const newCount = currentCount - 1;
                            
                            countElement.textContent = newCount + ' ' + 
                                (newCount === 1 ? 'товар' : 
                                 newCount < 5 ? 'товара' : 'товаров');
                                 
                            // Если товаров не осталось, показываем пустое состояние
                            if (newCount === 0) {
                                location.reload();
                            }
                        }
                        
                        // Показываем уведомление
                        if (typeof showToast === 'function') {
                            showToast(data.message, 'success');
                        }
                    }, 300);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                button.innerHTML = originalHtml;
                button.disabled = false;
                
                if (typeof showToast === 'function') {
                    showToast('Ошибка при удалении', 'error');
                }
            });
        });
    });
});