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