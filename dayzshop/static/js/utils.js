function getCookie(name) {
    if (!document.cookie) return null;
    
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [key, ...rest] = cookie.trim().split('=');
        if (key === name) return decodeURIComponent(rest.join('='));
    }
    return null;
}

function updateCartCounter(count) {
    const counters = document.querySelectorAll('.mini-badge');
    if (counters.length === 0) {
        console.warn('Счётчик корзины (.mini-badge) не найден');
        return;
    }
    counters.forEach(counter => {
        counter.textContent = count;
        counter.classList.add('animate-bounce');
        setTimeout(() => counter.classList.remove('animate-bounce'), 500);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.padding = '0.3rem 0';
            navbar.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        } else {
            navbar.style.padding = '0.5rem 0';
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }
    });
});