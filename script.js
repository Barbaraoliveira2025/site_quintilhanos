/* ============================================================
   SCRIPT PRINCIPAL - QUINTILHANOS
   Funcionalidades: Menu mobile, formulários, analytics, otimizações
   ============================================================ */

// Menu Mobile Toggle
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', navMenu.classList.contains('active'));
    });

    // Fechar menu ao clicar em um link
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

// Smooth Scroll para Links Internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            const target = document.querySelector(href);
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({ top: offsetTop, behavior: 'smooth' });
        }
    });
});

// Atualizar link ativo na navegação baseado no scroll
function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.menu a');

    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateActiveLink);

// Validação de Formulário
const formContato = document.getElementById('formContato');

if (formContato) {
    formContato.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validar campos
        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const telefone = document.getElementById('telefone').value.trim();
        const servico = document.getElementById('servico').value;

        if (!nome || !email || !telefone || !servico) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Por favor, insira um email válido.');
            return;
        }

        // Construir mensagem para WhatsApp
        const mensagem = document.getElementById('mensagem').value.trim();
        const textoWhatsApp = encodeURIComponent(
            `Olá Quintilhanos!\n\nGostaria de solicitar um orçamento.\n\nNome: ${nome}\nEmail: ${email}\nTelefone: ${telefone}\nServiço: ${servico}\nMensagem: ${mensagem}`
        );

        // Rastrear conversão
        trackEvent('lead', 'form_submit', servico);

        // Redirecionar para WhatsApp
        window.open(`https://wa.me/5511999999999?text=${textoWhatsApp}`, '_blank');

        // Limpar formulário
        formContato.reset();
    });
}

// Lazy Loading de Imagens
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
}

// Animar elementos ao entrar na viewport
if ('IntersectionObserver' in window) {
    const animateOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('[data-animate]').forEach(el => {
        animateOnScroll.observe(el);
    });
}

// Rastrear eventos para Analytics (Google Analytics)
function trackEvent(category, action, label) {
    if (typeof gtag === 'function') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
}

// Rastrear cliques em CTAs
document.querySelectorAll('.btn-primary, .btn-secondary, .whatsapp-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.classList.contains('whatsapp-btn') ? 'whatsapp' : 'cta';
        trackEvent('engagement', `${type}_click`, btn.textContent.trim());
    });
});

// Performance: Prefetch recursos
function prefetchResources() {
    const links = [
        'imagens/projeto-1-thumb.jpg',
        'imagens/projeto-2-thumb.jpg',
        'imagens/projeto-3-thumb.jpg'
    ];

    links.forEach(link => {
        const prefetch = document.createElement('link');
        prefetch.rel = 'prefetch';
        prefetch.href = link;
        document.head.appendChild(prefetch);
    });
}

if (navigator.connection && navigator.connection.saveData === false) {
    prefetchResources();
}

// Console bonitinho
console.log('%c🎨 Quintilhanos - Design Premium', 'font-size: 20px; font-weight: bold; color: #1a3a52;');
console.log('%cTransformamos espaços com excelência', 'font-size: 12px; color: #c0c0c0;');
console.log('%cVersão: 1.0.0 | Deploy: GitHub Pages', 'font-size: 10px; color: #999;');

// Verificar suporte a features críticas
window.addEventListener('load', () => {
    // Web Vitals básicos
    if ('PerformanceObserver' in window) {
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name.includes('paint')) {
                        console.log(`✓ ${entry.name}: ${Math.round(entry.startTime)}ms`);
                    }
                }
            });
            observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
        } catch (e) {
            // Ignorar se não suportado
        }
    }
});

// Verificar suporte ao Web Share API
if (navigator.share) {
    console.log('✓ Web Share API disponível');
}

// Service Worker (opcional para PWA futuro)
if ('serviceWorker' in navigator) {
    // navigator.serviceWorker.register('/sw.js');
}
