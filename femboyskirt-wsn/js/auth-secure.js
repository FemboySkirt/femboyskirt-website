// Secure Authentication System
class SecureAuthSystem {
    static STORAGE_KEYS = {
        USERS: 'fs_secure_users',
        AUTH: 'fs_secure_session',
        SETTINGS: 'fs_settings'
    };

    static init() {
        this.initializeSecureUsers();
        this.setupSessionExpiry();
    }

    static initializeSecureUsers() {
        // Инициализируем только если нет пользователей
        if (!localStorage.getItem(this.STORAGE_KEYS.USERS)) {
            const defaultUsers = [
                {
                    id: 1,
                    email: 'admin@femboyskirt.com',
                    passwordHash: this.hashPasswordSync('admin123'),
                    username: 'Admin',
                    tier: 'premium',
                    createdAt: new Date().toISOString(),
                    lastLogin: null
                },
                {
                    id: 2,
                    email: 'test@test.com',
                    passwordHash: this.hashPasswordSync('test123'), 
                    username: 'TestUser',
                    tier: 'approved',
                    createdAt: new Date().toISOString(),
                    lastLogin: null
                }
            ];
            this.saveUsers(defaultUsers);
        }
    }

    static hashPasswordSync(password) {
        // Синхронное хеширование для инициализации
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'secure_hash_' + Math.abs(hash).toString(36);
    }

    static async login(email, password) {
        if (!SecurityEnhanced.isValidEmail(email) || !password) {
            throw new Error('Invalid email or password');
        }

        try {
            const hashedPassword = await SecurityEnhanced.hashPassword(password);
            const users = this.getUsers();
            const user = users.find(u => 
                u.email === email.trim() && u.passwordHash === hashedPassword
            );

            if (user) {
                await this.createSecureSession(user);
                this.updateUserLogin(user.id);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            throw new Error('Authentication failed');
        }
    }

    static async createSecureSession(user) {
        const sessionData = {
            id: user.id,
            email: user.email,
            username: user.username,
            tier: user.tier,
            sessionId: this.generateSessionId(),
            loginTime: Date.now(),
            expiry: Date.now() + (8 * 60 * 60 * 1000) // 8 часов
        };

        // Сохраняем в sessionStorage (очищается при закрытии браузера)
        sessionStorage.setItem(this.STORAGE_KEYS.AUTH, JSON.stringify(sessionData));
        
        // Также сохраняем минимальные данные в localStorage для удобства
        localStorage.setItem('fs_user_display', JSON.stringify({
            username: user.username,
            tier: user.tier
        }));
    }

    static generateSessionId() {
        return 'sess_' + Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
    }

    static getCurrentUser() {
        try {
            const sessionData = sessionStorage.getItem(this.STORAGE_KEYS.AUTH);
            if (!sessionData) return null;

            const session = JSON.parse(sessionData);
            
            // Проверяем expiry
            if (Date.now() > session.expiry) {
                this.logout();
                return null;
            }

            return session;
        } catch (error) {
            this.logout();
            return null;
        }
    }

    static isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    static logout() {
        sessionStorage.removeItem(this.STORAGE_KEYS.AUTH);
        localStorage.removeItem('fs_user_display');
        SecurityEnhanced.clearSensitiveData();
    }

    static getUsers() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USERS) || '[]');
        } catch (error) {
            return [];
        }
    }

    static saveUsers(users) {
        localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
    }

    static updateUserLogin(userId) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            users[userIndex].lastLogin = new Date().toISOString();
            this.saveUsers(users);
        }
    }

    static setupSessionExpiry() {
        // Проверяем сессию каждую минуту
        setInterval(() => {
            const user = this.getCurrentUser();
            if (user && Date.now() > user.expiry) {
                this.logout();
                window.location.href = 'login.html';
            }
        }, 60000);
    }

    static requireAuth() {
        if (!this.isLoggedIn()) {
            SecurityEnhanced.safeRedirect('login.html');
            return false;
        }
        return true;
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    SecureAuthSystem.init();
});