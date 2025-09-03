// static/js/cart-service.js
import { getCookie } from './utils.js';

export class CartService {
    static async addToCart(productId, quantity = 1) {
        try {
            const response = await fetch(`/cart/add/${productId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                signal: AbortSignal.timeout(5000),
                body: `quantity=${quantity}`
            });
            
            if (!response.ok) throw new Error('Network error');
            return await response.json();
        } catch (error) {
            console.error('CartService error:', error);
            throw error;
        }
    }

    static async updateItem(itemId, quantity) {
        try {
            const response = await fetch(`/cart/update/${itemId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': getCookie('csrftoken'),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                signal: AbortSignal.timeout(5000),
                body: `quantity=${quantity}`
            });
            
            if (!response.ok) throw new Error('Network error');
            return await response.json();
        } catch (error) {
            console.error('CartService update error:', error);
            throw error;
        }
    }

    static async removeItem(itemId) {
        try {
            const response = await fetch(`/cart/remove/${itemId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                },
                signal: AbortSignal.timeout(5000)
            });
            
            if (!response.ok) throw new Error('Network error');
            return await response.json();
        } catch (error) {
            console.error('CartService remove error:', error);
            throw error;
        }
    }

    static async toggleSelection(itemId) {
        try {
            const response = await fetch(`/cart/toggle-selection/${itemId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                signal: AbortSignal.timeout(5000)
            });
            
            if (!response.ok) throw new Error('Network error');
            return await response.json();
        } catch (error) {
            console.error('CartService toggle selection error:', error);
            throw error;
        }
    }

    static async selectAll(selectAll) {
        try {
            const response = await fetch('/cart/select-all/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                signal: AbortSignal.timeout(5000),
                body: `select_all=${selectAll}`
            });
            
            if (!response.ok) throw new Error('Network error');
            return await response.json();
        } catch (error) {
            console.error('CartService select all error:', error);
            throw error;
        }
    }
}