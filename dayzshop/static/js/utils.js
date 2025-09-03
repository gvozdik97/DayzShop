// static/js/utils.js
export function getCookie(name) {
    if (!document.cookie) return null;
    
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [key, ...rest] = cookie.trim().split('=');
        if (key === name) return decodeURIComponent(rest.join('='));
    }
    return null;
}

export function updateCartCounter(count) {
    let counters = document.querySelectorAll('.mini-badge');
    
    // Если счётчика нет - создаём его
    if (counters.length === 0) {
        const cartUrlElement = document.getElementById('cart-data');
        if (!cartUrlElement) return;
        
        const cartUrl = cartUrlElement.dataset.cartUrl;
        const cartIcon = document.querySelector(`a[href="${cartUrl}"]`);
        
        if (cartIcon) {
            const badge = document.createElement('span');
            badge.className = 'position-absolute top-0 start-100 translate-middle bg-danger rounded-circle badge mini-badge';
            badge.textContent = count;
            
            // Проверяем, есть ли уже обёртка для значка
            let iconContainer = cartIcon.querySelector('.position-relative');
            if (!iconContainer) {
                iconContainer = document.createElement('div');
                iconContainer.className = 'position-relative mx-auto';
                iconContainer.style.width = 'fit-content';
                
                // Перемещаем иконку внутрь контейнера
                while (cartIcon.firstChild) {
                    iconContainer.appendChild(cartIcon.firstChild);
                }
                cartIcon.appendChild(iconContainer);
            }
            
            iconContainer.appendChild(badge);
            counters = document.querySelectorAll('.mini-badge');
        }
    }
    
    // Обновляем все существующие счётчики
    counters.forEach(counter => {
        counter.textContent = count;
        counter.classList.add('animate-bounce');
        setTimeout(() => counter.classList.remove('animate-bounce'), 500);
    });
}

export function showToast(message, type = 'success') {
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

// Инициализация для навбара (оставляем из header.js)
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.style.padding = '0.3rem 0';
                navbar.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
            } else {
                navbar.style.padding = '0.5rem 0';
                navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            }
        });
    }
});
