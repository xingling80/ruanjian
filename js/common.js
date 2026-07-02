// Common utilities and particle background

function initParticles() {
    const container = document.getElementById('particles-js');
    if (!container) return;

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 1.5;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.color = Math.random() > 0.5 ? 'rgba(75, 142, 255, 0.3)' : 'rgba(233, 179, 255, 0.2)';
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x > width) this.x = 0;
            if (this.x < 0) this.x = width;
            if (this.y > height) this.y = 0;
            if (this.y < 0) this.y = height;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        resize();
        particles = [];
        let particleCount = Math.min(Math.floor(window.innerWidth / 10), 100);
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        init();
    });

    init();
    animate();
}

function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-up').forEach(element => {
        observer.observe(element);
    });
}

function navigateTo(url) {
    window.location.href = url;
}

function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('已复制到剪贴板');
    });
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-6 right-6 px-6 py-3 rounded-lg z-50 animate-slide-up';
    toast.style.background = 'rgba(30, 31, 35, 0.95)';
    toast.style.backdropFilter = 'blur(20px)';
    toast.style.border = '1px solid rgba(255, 255, 255, 0.15)';
    toast.style.color = '#e3e2e7';
    toast.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.5)';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// 认证已统一使用 Supabase Auth，请勿使用 localStorage 自定义 token。
// 以下函数仅保留用于兼容旧代码，新代码请使用 supabase-client.js 中的 isAuthenticated()。
// 管理后台的 login/logout 由 supabase-client.js 处理，请勿在 common.js 中覆盖。

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initScrollAnimations();
});
