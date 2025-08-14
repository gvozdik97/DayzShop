// static/js/pagination.js
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('?')) {
                e.preventDefault();
                loadPage(this.getAttribute('href'));
            }
        });
    });
    
    function loadPage(url) {
        fetch(url, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.text())
        .then(html => {
            document.querySelector('#product-list').innerHTML = 
                new DOMParser().parseFromString(html, 'text/html')
                    .querySelector('#product-list').innerHTML;
            
            document.querySelector('.pagination').innerHTML = 
                new DOMParser().parseFromString(html, 'text/html')
                    .querySelector('.pagination').innerHTML;
                    
            window.scrollTo({top: 0, behavior: 'smooth'});
        });
    }
});