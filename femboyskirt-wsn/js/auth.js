// auth.js - Простая система авторизации
class AuthSystem {
    static isLoggedIn() {
        return localStorage.getItem('currentUser') !== null;
    }
    
    static getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser') || '{}');
    }
    
    static login(email, password) {
        // Простые тестовые пользователи
        const testUsers = [
            { email: 'admin@femboyskirt.com', password: 'admin123', username: 'Admin', tier: 'premium' },
            { email: 'test@test.com', password: 'test123', username: 'TestUser', tier: 'approved' }
        ];
        
        const user = testUsers.find(u => u.email === email && u.password === password);
        
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            return true;
        }
        return false;
    }
    
    static logout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
    
    static requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
}