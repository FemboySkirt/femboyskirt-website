// Secure Dashboard System
class SecureDashboard {
    static init() {
        if (!SecureAuthSystem.requireAuth()) {
            return;
        }
        
        this.loadUserData();
        this.setupSecureEventListeners();
        this.setupAutoLogout();
    }

    static loadUserData() {
        const user = SecureAuthSystem.getCurrentUser();
        if (!user) return;

        // Безопасное отображение данных
        const welcomeElement = document.getElementById('welcomeUser');
        const usernameElement = document.getElementById('userUsername');
        const emailElement = document.getElementById('userEmail');

        if (welcomeElement) {
            welcomeElement.textContent = `Welcome back, ${SecurityEnhanced.sanitizeText(user.username)}!`;
        }
        if (usernameElement) {
            usernameElement.textContent = SecurityEnhanced.sanitizeText(user.username);
        }
        if (emailElement) {
            emailElement.textContent = SecurityEnhanced.sanitizeText(user.email);
        }
    }

    static setupSecureEventListeners() {
        // Безопасная привязка событий
        const downloadBtn = document.getElementById('downloadBtn');
        const logoutBtn = document.querySelector('.logout-btn');

        if (downloadBtn) {
            downloadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSecureDownload();
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }

        // Запрещаем правый клик (опционально)
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    static async handleSecureDownload() {
        const btn = document.getElementById('downloadBtn');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<span>⏳ Preparing Download...</span>';
        btn.disabled = true;

        try {
            // Имитация безопасной загрузки
            await this.simulateSecureDownload();
            this.showSecureNotification('Download started successfully!', 'success');
        } catch (error) {
            this.showSecureNotification('Download failed. Please try again.', 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    static async simulateSecureDownload() {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Создаем безопасную загрузку
                const content = 'FemboySkirt Secure Installer v2.1.4';
                const blob = new Blob([content], { type: 'application/octet-stream' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = 'FemboySkirt_Secure_Installer.exe';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                resolve();
            }, 1500);
        });
    }

    static handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            SecureAuthSystem.logout();
            SecurityEnhanced.safeRedirect('index.html');
        }
    }

    static showSecureNotification(message, type = 'info') {
        // Используем безопасный метод показа уведомлений
        const notification = document.createElement('div');
        notification.textContent = SecurityEnhanced.sanitizeText(message);
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'error' ? '#da3633' : '#238636'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 4000);
    }

    static setupAutoLogout() {
        // Авто-выход при бездействии (30 минут)
        let timeout;
        const resetTimeout = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                SecureAuthSystem.logout();
                this.showSecureNotification('Session expired due to inactivity', 'error');
                setTimeout(() => {
                    SecurityEnhanced.safeRedirect('login.html');
                }, 2000);
            }, 30 * 60 * 1000); // 30 минут
        };

        ['click', 'mousemove', 'keypress'].forEach(event => {
            document.addEventListener(event, resetTimeout);
        });

        resetTimeout();
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    SecureDashboard.init();
});