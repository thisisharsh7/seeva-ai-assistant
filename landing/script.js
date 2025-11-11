// ============================================
// SMOOTH SCROLLING FOR ANCHOR LINKS
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        // Don't prevent default for links that just have "#"
        if (href === '#') return;

        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
            const navHeight = document.querySelector('.nav').offsetHeight;
            const targetPosition = target.offsetTop - navHeight - 20;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// NAVBAR BACKGROUND ON SCROLL
// ============================================
const nav = document.querySelector('.nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add shadow when scrolled
    if (currentScroll > 50) {
        nav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    } else {
        nav.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// ============================================
// COPY TO CLIPBOARD FUNCTIONALITY
// ============================================
window.copyToClipboard = function(button) {
    const codeSnippet = button.previousElementSibling;
    const code = codeSnippet.textContent;

    navigator.clipboard.writeText(code).then(() => {
        // Change button icon to checkmark
        const originalHTML = button.innerHTML;
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
        `;
        button.style.color = '#10b981';

        // Reset after 2 seconds
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// ============================================
// ANIMATE ELEMENTS ON SCROLL
// ============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections and cards
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll(`
        .feature-card,
        .problem-card,
        .showcase-item,
        .step-card,
        .tech-card,
        .use-case
    `);

    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// ============================================
// TYPING ANIMATION FOR DEMO
// ============================================
const demoTyping = document.querySelector('.demo-typing');
if (demoTyping) {
    const messages = [
        'Ask me anything...',
        'Explain this code...',
        'Review this design...',
        'Fix this error...',
        'Analyze this chart...'
    ];
    let messageIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        const currentMessage = messages[messageIndex];

        if (!isDeleting) {
            demoTyping.textContent = currentMessage.substring(0, charIndex + 1);
            charIndex++;

            if (charIndex === currentMessage.length) {
                isDeleting = true;
                typingSpeed = 50;
                setTimeout(type, 2000); // Pause before deleting
                return;
            }
        } else {
            demoTyping.textContent = currentMessage.substring(0, charIndex - 1);
            charIndex--;

            if (charIndex === 0) {
                isDeleting = false;
                messageIndex = (messageIndex + 1) % messages.length;
                typingSpeed = 100;
                setTimeout(type, 500); // Pause before next message
                return;
            }
        }

        setTimeout(type, typingSpeed);
    }

    // Start typing animation
    setTimeout(type, 1000);
}

// ============================================
// WATCH SCREEN BUTTON ANIMATION
// ============================================
const watchBtn = document.querySelector('.watch-btn');
if (watchBtn) {
    watchBtn.addEventListener('click', function() {
        // Add pulse animation
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });
}

// ============================================
// KEYBOARD SHORTCUT LISTENER (EASTER EGG)
// ============================================
let keys = [];
const shortcut = ['Meta', 'Shift', 'c']; // Cmd+Shift+C

document.addEventListener('keydown', (e) => {
    keys.push(e.key);

    // Keep only last 3 keys
    if (keys.length > 3) {
        keys.shift();
    }

    // Check if shortcut matches
    const match = shortcut.every((key, index) => {
        return keys[index] === key ||
               (key === 'Meta' && (keys[index] === 'Meta' || keys[index] === 'Command'));
    });

    if (match) {
        // Show easter egg message
        showNotification('🎉 That\'s the spirit! Press ⌘⇧C in the actual app to summon Seeva.');
        keys = [];
    }
});

document.addEventListener('keyup', () => {
    keys = [];
});

// ============================================
// NOTIFICATION SYSTEM
// ============================================
function showNotification(message) {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    // Create notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: rgba(139, 92, 246, 0.95);
        backdrop-filter: blur(20px);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(139, 92, 246, 0.4);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
        font-weight: 600;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add notification animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// DOWNLOAD BUTTON CLICK HANDLER
// ============================================
document.querySelectorAll('.download-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        // Since we don't have actual download yet, show notification
        if (this.getAttribute('href') === '#') {
            e.preventDefault();
            showNotification('📦 Download coming soon! Star on GitHub to get notified.');
        }
    });
});

// ============================================
// STATS COUNTER ANIMATION
// ============================================
function animateCounter(element, target, suffix = '') {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + suffix;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + suffix;
        }
    }, 30);
}

// Observe stats section
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const stats = entry.target.querySelectorAll('.stat-value');
            stats.forEach(stat => {
                const text = stat.textContent;
                if (text.includes('min')) {
                    animateCounter(stat, 12, 'min');
                }
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

// ============================================
// MODEL CARDS HOVER EFFECT
// ============================================
document.querySelectorAll('.model-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))';
    });

    card.addEventListener('mouseleave', function() {
        this.style.background = '';
    });
});

// ============================================
// FEATURE CARDS TILT EFFECT (SUBTLE)
// ============================================
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
});

// ============================================
// CONSOLE LOG EASTER EGG
// ============================================
console.log(`
%c
   _____ _____ _____ _   _   ___
  / ____|  ___|  ___| | | | / _ \\
  \\__ \\| |__ | |__ | | | || |_| |
  |___/|_____|____|\\_|  |_/ \\___/

  Built with ❤️ by developers, for developers

  🚀 Want to contribute? Check out the repo!
  🔧 Press Cmd+Shift+C to trigger the easter egg

`, 'color: #8B5CF6; font-family: monospace; font-size: 12px;');

console.log('%cSeeva AI Assistant', 'color: #EC4899; font-size: 24px; font-weight: bold;');
console.log('%cStop context switching. Start flowing.', 'color: #a78bfa; font-size: 14px;');

// ============================================
// PERFORMANCE MONITORING (DEV ONLY)
// ============================================
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.addEventListener('load', () => {
        if (window.performance) {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`%c⚡ Page loaded in ${pageLoadTime}ms`, 'color: #10b981; font-weight: bold;');
        }
    });
}
