// app.js - Основная логика приложения
class FemboySkirtApp {
    static init() {
        this.setupEventListeners();
        this.checkAuthState();
        this.loadApplicationStats();
    }
    
    static setupEventListeners() {
        // Обработчик формы заявки на главной странице
        const inviteForm = document.querySelector('.invite-form');
        if (inviteForm) {
            inviteForm.addEventListener('submit', this.handleApplicationSubmit.bind(this));
        }
        
        // Обработчики навигации
        this.setupNavigation();
    }
    
    static checkAuthState() {
        // Показываем/скрываем элементы в зависимости от авторизации
        const user = AuthSystem.getCurrentUser();
        const loginLink = document.querySelector('a[href="login.html"]');
        const logoutLink = document.querySelector('a[onclick="logout()"]');
        
        if (user && user.email) {
            if (loginLink) loginLink.style.display = 'none';
            if (logoutLink) logoutLink.style.display = 'block';
        } else {
            if (loginLink) loginLink.style.display = 'block';
            if (logoutLink) logoutLink.style.display = 'none';
        }
    }
    
    static handleApplicationSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const submitButton = form.querySelector('.submit-button');
        
        // Валидация
        if (!this.validateApplicationForm(form)) {
            return;
        }
        
        // Показываем загрузку
        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;
        
        // Создаем объект заявки
        const application = {
            email: formData.get('email') || form.querySelector('input[type="email"]').value,
            experience: formData.get('experience') || form.querySelector('select').value,
            interest: formData.get('interest') || form.querySelector('textarea').value,
            source: 'website'
        };
        
        // Сохраняем заявку
        setTimeout(() => {
            try {
                const newApp = Database.createApplication(application);
                this.showApplicationSuccess(newApp);
                form.reset();
            } catch (error) {
                this.showError('Failed to submit application. Please try again.');
            } finally {
                submitButton.textContent = 'Submit Application';
                submitButton.disabled = false;
            }
        }, 1500);
    }
    
    static validateApplicationForm(form) {
        const email = form.querySelector('input[type="email"]');
        const experience = form.querySelector('select');
        const interest = form.querySelector('textarea');
        
        // Проверка email
        if (!email.value || !this.isValidEmail(email.value)) {
            this.showError('Please enter a valid email address');
            email.focus();
            return false;
        }
        
        // Проверка опыта
        if (!experience.value) {
            this.showError('Please select your experience level');
            experience.focus();
            return false;
        }
        
        // Проверка интереса
        if (!interest.value || interest.value.trim().length < 10) {
            this.showError('Please tell us more about your interest (minimum 10 characters)');
            interest.focus();
            return false;
        }
        
        return true;
    }
    
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    static showApplicationSuccess(application) {
        // Показываем секцию статуса
        const statusSection = document.querySelector('.status-section');
        const appIdElement = document.getElementById('appId');
        const statusBadge = document.getElementById('statusBadge');
        
        if (statusSection && appIdElement && statusBadge) {
            appIdElement.textContent = application.id;
            statusBadge.textContent = 'Submitted';
            statusBadge.className = 'status-badge status-submitted';
            statusSection.style.display = 'block';
            
            // Прокручиваем к статусу
            statusSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Показываем уведомление
        this.showNotification('🎉 Application submitted successfully!', 'success');
    }
    
    static showError(message) {
        this.showNotification(message, 'error');
    }
    
    static showNotification(message, type = 'info') {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Стили для уведомления
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'error' ? '#da3633' : type === 'success' ? '#238636' : '#161b22'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            border: 1px solid ${type === 'error' ? '#f85149' : type === 'success' ? '#2ea043' : '#30363d'};
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Автоматическое скрытие
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
        
        // Закрытие по клику
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }
    
    static setupNavigation() {
        // Плавная прокрутка для якорных ссылок
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    static loadApplicationStats() {
        // Загружаем статистику для главной страницы
        const stats = Database.getApplicationStats();
        console.log('Application Statistics:', stats);
    }
}

// CSS анимации для уведомлений
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        margin-left: 10px;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    
    .notification-message {
        flex: 1;
        margin-right: 10px;
    }
`;
document.head.appendChild(notificationStyles);

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    FemboySkirtApp.init();
    console.log('✅ FemboySkirt App initialized');
});