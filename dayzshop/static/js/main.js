import { CartUI } from './cart-ui.js';
import { WishlistUI } from './wishlist-ui.js';

// Главный файл инициализации
console.log('DayZ Shop application initialized');

// Устанавливаем высоту шапки для CSS переменных
document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.fixed-header');
    if (header) {
        document.documentElement.style.setProperty(
            '--header-height', 
            `${header.offsetHeight}px`
        );
    }

    CartUI.initCartStateSync();
    WishlistUI.initWishlistButtons();
});