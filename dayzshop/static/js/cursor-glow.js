// static/js/cursor-glow.js
export class CursorGlowEffect {
    constructor() {
        this.glowElement = document.getElementById('cursorGlow');
        this.container = document.getElementById('serverInfoCard');
        this.isInside = false;
        this.targetX = 0;
        this.targetY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.lerpFactor = 0.1;
        
        if (this.glowElement && this.container) {
            this.init();
        }
    }

    init() {
        this.bindEvents();
        this.animate();
    }

    bindEvents() {
        // События для контейнера
        this.container.addEventListener('mouseenter', () => {
            this.isInside = true;
            this.glowElement.classList.add('active');
        });

        this.container.addEventListener('mouseleave', () => {
            this.isInside = false;
            this.glowElement.classList.remove('active');
            
            // Сбрасываем позицию
            this.currentX = 0;
            this.currentY = 0;
            this.targetX = 0;
            this.targetY = 0;
        });

        // Движение курсора внутри контейнера
        this.container.addEventListener('mousemove', (e) => {
            if (!this.isInside) return;

            const rect = this.container.getBoundingClientRect();
            this.targetX = e.clientX - rect.left;
            this.targetY = e.clientY - rect.top;
        });
    }

    // Линейная интерполяция для плавного движения
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    animate() {
        if (this.isInside) {
            // Плавное движение к целевой позиции
            this.currentX = this.lerp(this.currentX, this.targetX, this.lerpFactor);
            this.currentY = this.lerp(this.currentY, this.targetY, this.lerpFactor);
            
            this.glowElement.style.left = `${this.currentX}px`;
            this.glowElement.style.top = `${this.currentY}px`;
            
            // Вычисляем скорость для динамических эффектов
            const dx = this.targetX - this.currentX;
            const dy = this.targetY - this.currentY;
            const speed = Math.sqrt(dx * dx + dy * dy);
            
            // Динамическое изменение размера based on speed
            const scale = 1 + Math.min(speed * 0.01, 0.3);
            this.glowElement.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${speed * 0.2}deg)`;
            
            // Динамическое изменение размытия
            const blur = 25 + Math.sin(Date.now() * 0.001) * 5;
            this.glowElement.style.filter = `blur(${blur}px) brightness(${1.1 + Math.cos(Date.now() * 0.0015) * 0.1})`;
        }
        
        requestAnimationFrame(this.animate.bind(this));
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    new CursorGlowEffect();
});