// Enhanced Security System
class SecurityEnhanced {
    // Санитизация HTML
    static sanitizeHTML(input) {
        if (input === null || input === undefined) return '';
        if (typeof input !== 'string') return String(input);
        
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }
    
    // Санитизация текста (для текстовых полей)
    static sanitizeText(input) {
        if (input === null || input === undefined) return '';
        if (typeof input !== 'string') return String(input);
        
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;')
            .replace(/\\/g, '&#x5C;')
            .replace(/`/g, '&#96;');
    }
    
    // Безопасный innerHTML
    static safeInnerHTML(element, content) {
        if (!element) return;
        element.textContent = '';
        const sanitized = this.sanitizeHTML(content);
        element.innerHTML = sanitized;
    }
    
    // Валидация email
    static isValidEmail(email) {
        if (typeof email !== 'string') return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }
    
    // Генерация CSRF токена
    static generateCSRFToken() {
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            const token = crypto.getRandomValues(new Uint8Array(32));
            const tokenString = Array.from(token).map(b => b.toString(16).padStart(2, '0')).join('');
            sessionStorage.setItem('csrf_token', tokenString);
            return tokenString;
        } else {
            // Fallback для старых браузеров
            const token = 'csrf_' + Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
            sessionStorage.setItem('csrf_token', token);
            return token;
        }
    }
    
    // Валидация CSRF токена
    static validateCSRFToken(token) {
        const storedToken = sessionStorage.getItem('csrf_token');
        return storedToken && token && storedToken === token;
    }
    
    // Безопасный редирект
    static safeRedirect(url) {
        if (!url || typeof url !== 'string') return false;
        
        try {
            // Проверяем, что URL относительный и безопасный
            const absoluteUrl = new URL(url, window.location.origin);
            if (absoluteUrl.origin === window.location.origin) {
                window.location.href = url;
                return true;
            }
        } catch (e) {
            console.error('Invalid redirect URL:', e);
        }
        return false;
    }
    
    // Хеширование пароля (клиентская сторона)
    static async hashPassword(password) {
        if (typeof password !== 'string' || password.length === 0) {
            throw new Error('Invalid password');
        }
        
        if (typeof crypto !== 'undefined' && crypto.subtle) {
            // Modern browsers - использовать Web Crypto API
            const encoder = new TextEncoder();
            const data = encoder.encode(password + '|femboyskirt_salt_2024');
            const hash = await crypto.subtle.digest('SHA-256', data);
            return Array.from(new Uint8Array(hash))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        } else {
            // Fallback для старых браузеров
            let hash = 0;
            for (let i = 0; i < password.length; i++) {
                const char = password.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return 'legacy_hash_' + Math.abs(hash).toString(36);
        }
    }
    
    // Валидация длины текста
    static isValidTextLength(text, min = 1, max = 10000) {
        return text && typeof text === 'string' && 
               text.length >= min && text.length <= max;
    }
    
    // Очистка чувствительных данных
    static clearSensitiveData() {
        sessionStorage.removeItem('csrf_token');
        // Не очищаем localStorage полностью, чтобы сохранить настройки
        // но удаляем чувствительные данные
        localStorage.removeItem('currentUser');
        localStorage.removeItem('femboyskirt_auth');
    }
}