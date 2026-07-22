/**
 * QUINTILHANOS - Script Principal
 * Especializada em design premium, otimizações de performance
 * Desenvolvido com padrões profissionais e sem dependências externas
 */

'use strict';

// ============================================================
// CONFIGURAÇÕES GLOBAIS
// ============================================================

const CONFIG = {
    TELEFONE: '5547992772453',
    SCROLL_OFFSET: 80,
    DEBOUNCE_DELAY: 150,
    ANIMATION_THRESHOLD: 0.1
};

// ============================================================
// UTILIDADES
// ============================================================

/**
 * Debounce para otimizar chamadas de funções
 * @param {Function} func - Função a executar
 * @param {number} delay - Delay em ms
 */
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

/**
 * Throttle para limitar chamadas repetidas
 * @param {Function} func - Função a executar
 * @param {number} limit - Limite em ms
 */
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Track evento para analytics
 * @param {string} category - Categoria do evento
 * @param {string} action - Ação realizada
 * @param {string} label - Label do evento
 * @param {number} value - Valor (opcional)
 */
function trackEvent(category, action, label, value = null) {
    if (typeof gtag === 'function') {
        const payload = {
            event_category: category,
            event_label: label
        };
        if (value) payload.value = value;
        gtag('event', action, payload);
    }
    
    // Fallback para console em desenvolvimento
    console.debug(`📊 Track: ${category} > ${action} > ${label}`);
}

// ============================================================
// MENU MOBILE
// ============================================================

function initMenuMobile() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (!menuToggle || !navMenu) return;

    // Toggle menu
    menuToggle.addEventListener('click', () => {
        const isActive = navMenu.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', isActive);
        
        // Animar ícone hamburger
        menuToggle.classList.toggle('open', isActive);
        trackEvent('engagement', 'menu_toggle', isActive ? 'open' : 'close');
    });

    // Fechar ao clicar em link
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// ============================================================
// SMOOTH SCROLL
// ============================================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();
            const offsetTop = target.offsetTop - CONFIG.SCROLL_OFFSET;

            // Usar native API se disponível
            if ('scrollIntoView' in target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            }

            trackEvent('navigation', 'smooth_scroll', href);
        });
    });
}

// ============================================================
// NAVEGAÇÃO ATIVA
// ============================================================

function initActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.menu a[href^="#"]');

    if (sections.length === 0 || navLinks.length === 0) return;

    const updateActiveLink = throttle(() => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= sectionTop - CONFIG.SCROLL_OFFSET) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }, CONFIG.DEBOUNCE_DELAY);

    window.addEventListener('scroll', updateActiveLink, { passive: true });
}

// ============================================================
// FORMULÁRIO DE CONTATO
// ============================================================

function initContactForm() {
    const form = document.getElementById('formContato');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Capturar e validar dados
        const formData = {
            nome: document.getElementById('nome')?.value.trim(),
            email: document.getElementById('email')?.value.trim(),
            telefone: document.getElementById('telefone')?.value.trim(),
            servico: document.getElementById('servico')?.value,
            mensagem: document.getElementById('mensagem')?.value.trim() || ''
        };

        // Validações
        if (!formData.nome || !formData.email || !formData.telefone || !formData.servico) {
            showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }

        if (!isValidEmail(formData.email)) {
            showNotification('Email inválido. Tente novamente.', 'error');
            return;
        }

        if (!isValidPhone(formData.telefone)) {
            showNotification('Telefone deve conter apenas números e hífens.', 'error');
            return;
        }

        // Rastrear conversão
        trackEvent('lead', 'form_submit', formData.servico);

        // Construir URL WhatsApp
        const mensaje = encodeURIComponent(
            `*ORÇAMENTO - Quintilhanos*\n\n` +
            `Nome: ${formData.nome}\n` +
            `Email: ${formData.email}\n` +
            `Telefone: ${formData.telefone}\n` +
            `Serviço: ${formData.servico}\n` +
            `Mensagem: ${formData.mensagem || 'Sem mensagem adicional'}`
        );

        // Abrir WhatsApp
        window.open(`https://wa.me/${CONFIG.TELEFONE}?text=${mensaje}`, '_blank');

        // Feedback visual
        showNotification('Redirecionando para WhatsApp...', 'success');
        
        // Reset formulário
        setTimeout(() => form.reset(), 500);
    });
}

/**
 * Validar email
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Validar telefone
 */
function isValidPhone(phone) {
    const regex = /^[\d\s\-\(\)]+$/;
    return regex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Mostrar notificação ao usuário
 */
function showNotification(message, type = 'info') {
    // Remover notificação anterior se existir
    const oldNotif = document.querySelector('[role="alert"]');
    if (oldNotif) oldNotif.remove();

    const notif = document.createElement('div');
    notif.setAttribute('role', 'alert');
    notif.className = `notification notification-${type}`;
    notif.textContent = message;
    notif.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: ${type === 'error' ? '#dc3545' : '#28a745'};
        color: white;
        border-radius: 4px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notif);

    setTimeout(() => notif.remove(), 4000);
}

// ============================================================
// LAZY LOADING - IMAGENS
// ============================================================

function initLazyLoading() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const img = entry.target;
            const src = img.dataset.src || img.src;

            // Se já tem src, não fazer nada
            if (img.src === src) return;

            img.src = src;
            img.classList.add('loaded');
            
            img.addEventListener('load', () => {
                img.classList.add('optimized');
            });

            observer.unobserve(img);
        });
    }, {
        rootMargin: '50px',
        threshold: 0.01
    });

    document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
}

// ============================================================
// ANIMAÇÕES AO SCROLL
// ============================================================

function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: CONFIG.ANIMATION_THRESHOLD
    });

    // Animar cards de serviços e diferenciais
    document.querySelectorAll(
        '.servico-card, .diferencial-item, .depoimento-card'
    ).forEach(el => {
        el.setAttribute('data-animate', 'true');
        observer.observe(el);
    });
}

// ============================================================
// CTA CLICKS TRACKING
// ============================================================

function initCtaTracking() {
    // Botões principais
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.textContent.trim();
            trackEvent('engagement', 'cta_click', text);
        });
    });

    // Botão WhatsApp
    const whatsappBtn = document.querySelector('.whatsapp-btn');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            trackEvent('engagement', 'whatsapp_click', 'floating_button');
        });
    }
}

// ============================================================
// PERFORMANCE - PREFETCH
// ============================================================

function initResourcePrefetch() {
    // Apenas se conexão não é limitada
    if (navigator.connection?.saveData === true) return;

    const resources = [
        'imagens/projeto-1-thumb.jpg',
        'imagens/projeto-2-thumb.jpg',
        'imagens/projeto-3-thumb.jpg'
    ];

    resources.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        link.as = 'image';
        document.head.appendChild(link);
    });
}

// ============================================================
// WEB VITALS
// ============================================================

function initWebVitals() {
    if (!('PerformanceObserver' in window)) return;

    try {
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                console.debug(`✓ LCP: ${Math.round(entry.renderTime)}ms`);
            }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                console.debug(`✓ FID: ${Math.round(entry.processingDuration)}ms`);
            }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
        console.debug('Web Vitals não disponível');
    }
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar componentes na ordem
    initMenuMobile();
    initSmoothScroll();
    initActiveNavigation();
    initContactForm();
    initLazyLoading();
    initScrollAnimations();
    initCtaTracking();
    initResourcePrefetch();
});

// Web Vitals - executar após load
window.addEventListener('load', () => {
    initWebVitals();
    console.log('%c✅ Quintilhanos - Carregamento Completo', 'font-size: 14px; color: #f5a623; font-weight: bold;');
});

// Service Worker (PWA - futura implementação)
// if ('serviceWorker' in navigator && location.protocol === 'https:') {
//     navigator.serviceWorker.register('/sw.js').catch(err => console.debug('SW falhou:', err));
// }
