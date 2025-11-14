// security.js - Функции безопасности
class Security {
    // Санитизация HTML
    static sanitizeHTML(input) {
        if (typeof input !== 'string') return input;
        
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }
    
    // Санитизация для текстовых полей
    static sanitizeText(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;')
            .replace(/\\/g, '&#x5C;')
            .replace(/`/g, '&#96;');
    }
    
    // Валидация email
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Валидация текстовой длины
    static isValidTextLength(text, min = 1, max = 1000) {
        return text && text.length >= min && text.length <= max;
    }
    
    // Экранирование для URL
    static encodeURLParam(param) {
        return encodeURIComponent(param).replace(/[!'()*]/g, function(c) {
            return '%' + c.charCodeAt(0).toString(16);
        });
    }
    
    // CSRF защита
    static generateCSRFToken() {
        if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
            // Fallback для браузеров без crypto
            return 'csrf_' + Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
        }
        
        const token = crypto.getRandomValues(new Uint8Array(16));
        const tokenString = Array.from(token).map(b => b.toString(16).padStart(2, '0')).join('');
        sessionStorage.setItem('csrfToken', tokenString);
        return tokenString;
    }
    
    static validateCSRFToken(token) {
        const storedToken = sessionStorage.getItem('csrfToken');
        return storedToken && storedToken === token;
    }
    
    // XSS защита для innerHTML
    static safeInnerHTML(element, content) {
        if (!element) return;
        element.textContent = '';
        const sanitized = this.sanitizeHTML(content);
        element.innerHTML = sanitized;
    }
    
    // Проверка безопасного URL для редиректов
    static isSafeRedirect(url) {
        if (!url || typeof url !== 'string') return false;
        
        try {
            const parsed = new URL(url, window.location.origin);
            return parsed.origin === window.location.origin;
        } catch (e) {
            return false;
        }
    }
}