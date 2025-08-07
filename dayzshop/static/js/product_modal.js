document.addEventListener('DOMContentLoaded', function() {
    const productModal = document.getElementById('productModal');
    
    productModal.addEventListener('show.bs.modal', function(event) {
        const button = event.relatedTarget;
        const productId = button.getAttribute('data-product-id');
        
        fetch(`/products/${productId}/modal/`)
            .then(response => response.text())
            .then(html => {
                document.getElementById('productModalBody').innerHTML = html;
                document.getElementById('productModalLabel').textContent = 
                    document.querySelector('#productModal .product-name').textContent;
            });
    });
    
    // Очистка при закрытии
    productModal.addEventListener('hidden.bs.modal', function() {
        document.getElementById('productModalBody').innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Загрузка...</span>
                </div>
            </div>`;
    });
});