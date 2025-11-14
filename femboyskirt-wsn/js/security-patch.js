// Security Patch - Apply all fixes
class SecurityPatch {
    static applyAllFixes() {
        this.removeInsecureEventHandlers();
        this.sanitizeExistingContent();
        this.addSecurityHeaders();
        this.disableInsecureFeatures();
    }

    static removeInsecureEventHandlers() {
        // Удаляем все inline event handlers
        document.querySelectorAll('[onclick]').forEach(element => {
            const handler = element.getAttribute('onclick');
            element.removeAttribute('onclick');
            
            // Безопасно перепривязываем обработчики
            if (handler && typeof window[handler.replace(/\(.*\)/, '')] === 'function') {
                const eventName = handler.includes('logout') ? 'logout' : 'click';
                element.addEventListener('click', window[handler.replace(/\(.*\)/, '')]);
            }
        });
    }

    static sanitizeExistingContent() {
        // Санитизируем весь существующий контент
        document.querySelectorAll('[data-sanitize]').forEach(element => {
            element.textContent = SecurityEnhanced.sanitizeText(element.textContent);
        });
    }

    static addSecurityHeaders() {
        // Добавляем security headers через meta tags
        if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
            const csp = document.createElement('meta');
            csp.httpEquiv = "Content-Security-Policy";
            csp.content = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';";
            document.head.appendChild(csp);
        }
    }

    static disableInsecureFeatures() {
        // Отключаем потенциально опасные функции
        delete window.eval;
        window.alert = function() { console.log('Alert disabled for security'); };
    }
}

// Применяем исправления при загрузке
document.addEventListener('DOMContentLoaded', function() {
    SecurityPatch.applyAllFixes();
    console.log('🔒 Security patches applied');
});