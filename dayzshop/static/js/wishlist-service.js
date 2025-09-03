// static/js/wishlist-service.js
import { getCookie } from './utils.js';

export class WishlistService {
    static async toggleWishlist(productId) {
        try {
            const response = await fetch(`/wishlist/toggle/${productId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                signal: AbortSignal.timeout(5000)
            });
            
            if (!response.ok) throw new Error('Network error');
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server returned non-JSON response');
            }
            
            return await response.json();
        } catch (error) {
            console.error('WishlistService error:', error);
            throw error;
        }
    }
}