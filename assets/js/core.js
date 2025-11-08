// ================================================
// CORE.JS - Базові модулі Tasky
// Об'єднує: storage.js, theme.js, animations.js
// ================================================

// ================================================
// STORAGE - Робота з localStorage
// ================================================

const Storage = {
    TASKS_KEY: 'tasky_tasks',

    getTasks() {
        try {
            const tasks = localStorage.getItem(this.TASKS_KEY);
            return tasks ? JSON.parse(tasks) : [];
        } catch (error) {
            console.error('Помилка при читанні задач:', error);
            return [];
        }
    },

    saveTasks(tasks) {
        try {
            localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
            return true;
        } catch (error) {
            console.error('Помилка при збереженні задач:', error);
            if (error.name === 'QuotaExceededError') {
                alert('Сховище заповнене! Видаліть деякі задачі.');
            }
            return false;
        }
    },

    addTask(text, priority = 'medium', deadline = null, category = '') {
        if (!text || text.trim() === '') {
            return null;
        }

        const tasks = this.getTasks();
        const newTask = {
            id: Date.now().toString(),
            text: text.trim(),
            completed: false,
            priority: priority,
            deadline: deadline,
            category: category,
            notes: '',
            subtasks: [],
            createdAt: new Date().toISOString()
        };

        tasks.push(newTask);
        
        if (this.saveTasks(tasks)) {
            return newTask;
        }
        
        return null;
    },

    deleteTask(id) {
        const tasks = this.getTasks();
        const filteredTasks = tasks.filter(task => task.id !== id);
        
        if (filteredTasks.length === tasks.length) {
            return false;
        }
        
        return this.saveTasks(filteredTasks);
    },

    toggleTask(id) {
        const tasks = this.getTasks();
        const task = tasks.find(t => t.id === id);
        
        if (!task) {
            return false;
        }
        
        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;
        
        return this.saveTasks(tasks);
    },

    clearCompleted() {
        const tasks = this.getTasks();
        const activeTasks = tasks.filter(task => !task.completed);
        const deletedCount = tasks.length - activeTasks.length;
        
        if (deletedCount > 0) {
            this.saveTasks(activeTasks);
        }
        
        return deletedCount;
    },

    getStats() {
        const tasks = this.getTasks();
        
        return {
            total: tasks.length,
            active: tasks.filter(t => !t.completed).length,
            completed: tasks.filter(t => t.completed).length
        };
    },

    clearAll() {
        try {
            localStorage.removeItem(this.TASKS_KEY);
            return true;
        } catch (error) {
            console.error('Помилка при очищенні даних:', error);
            return false;
        }
    },

    hasSpace() {
        try {
            const testKey = '__test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    },

    exportTasks() {
        const tasks = this.getTasks();
        return JSON.stringify(tasks, null, 2);
    },

    importTasks(jsonString) {
        try {
            const tasks = JSON.parse(jsonString);
            
            if (!Array.isArray(tasks)) {
                throw new Error('Некоректний формат даних');
            }
            
            const validTasks = tasks.filter(task => 
                task.id && 
                task.text && 
                typeof task.completed === 'boolean'
            );
            
            return this.saveTasks(validTasks);
        } catch (error) {
            console.error('Помилка при імпорті задач:', error);
            return false;
        }
    }
};

// ================================================
// THEME - Перемикання теми
// ================================================

const Theme = {
    THEME_KEY: 'tasky_theme',
    
    init() {
        const savedTheme = this.getTheme();
        this.applyTheme(savedTheme);
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggle());
        }
    },
    
    getTheme() {
        return localStorage.getItem(this.THEME_KEY) || 'dark';
    },
    
    saveTheme(theme) {
        localStorage.setItem(this.THEME_KEY, theme);
    },
    
    applyTheme(theme) {
        const body = document.body;
        const themeIcon = document.querySelector('.theme-icon');
        
        if (theme === 'light') {
            body.classList.add('light-theme');
            if (themeIcon) themeIcon.textContent = '☀️';
        } else {
            body.classList.remove('light-theme');
            if (themeIcon) themeIcon.textContent = '🌙';
        }
        
        this.saveTheme(theme);
    },
    
    toggle() {
        const currentTheme = this.getTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.style.transform = 'rotate(360deg) scale(1.2)';
            setTimeout(() => {
                themeToggle.style.transform = '';
            }, 300);
        }
        
        this.applyTheme(newTheme);
    },
    
    isDark() {
        return this.getTheme() === 'dark';
    },
    
    isLight() {
        return this.getTheme() === 'light';
    }
};

// ================================================
// ANIMATIONS - Анімації для задач
// ================================================

const Animations = {
    addTask(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(-20px)';
        
        requestAnimationFrame(() => {
            element.style.transition = 'all 0.4s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    },

    removeTask(element, callback) {
        element.style.transition = 'all 0.4s ease-out';
        element.style.opacity = '0';
        element.style.transform = 'translateX(100px)';
        
        setTimeout(() => {
            if (callback) callback();
        }, 400);
    },

    toggleTask(element) {
        element.style.transition = 'all 0.3s ease-in-out';
        element.style.transform = 'scale(1.05)';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 150);
    },

    showError(element) {
        element.classList.add('error');
        element.style.animation = 'shake 0.5s ease-in-out';
        
        setTimeout(() => {
            element.style.animation = '';
            element.classList.remove('error');
        }, 500);
    },

    buttonSuccess(button) {
        const originalText = button.innerHTML;
        
        button.style.transform = 'scale(0.95)';
        button.style.background = 'var(--success)';
        
        setTimeout(() => {
            button.style.transform = 'scale(1)';
            button.style.background = '';
        }, 200);
    },

    ripple(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            transform: scale(0);
            animation: ripple-animation 0.6s ease-out;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    },

    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        requestAnimationFrame(() => {
            element.style.transition = `opacity ${duration}ms ease-in-out`;
            element.style.opacity = '1';
        });
    },

    fadeOut(element, duration = 300, callback) {
        element.style.transition = `opacity ${duration}ms ease-in-out`;
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.style.display = 'none';
            if (callback) callback();
        }, duration);
    },

    slideDown(element, duration = 300) {
        element.style.height = '0';
        element.style.overflow = 'hidden';
        element.style.display = 'block';
        
        const height = element.scrollHeight;
        
        requestAnimationFrame(() => {
            element.style.transition = `height ${duration}ms ease-out`;
            element.style.height = `${height}px`;
        });
        
        setTimeout(() => {
            element.style.height = '';
            element.style.overflow = '';
        }, duration);
    },

    slideUp(element, duration = 300, callback) {
        const height = element.scrollHeight;
        element.style.height = `${height}px`;
        element.style.overflow = 'hidden';
        
        requestAnimationFrame(() => {
            element.style.transition = `height ${duration}ms ease-out`;
            element.style.height = '0';
        });
        
        setTimeout(() => {
            element.style.display = 'none';
            element.style.height = '';
            element.style.overflow = '';
            if (callback) callback();
        }, duration);
    },

    bounce(element) {
        element.style.animation = 'bounce 0.5s ease-in-out';
        
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    },

    pulse(element) {
        element.style.animation = 'pulse 0.3s ease-in-out';
        
        setTimeout(() => {
            element.style.animation = '';
        }, 300);
    },

    scrollToElement(element, container) {
        if (!element || !container) return;
        
        const elementTop = element.offsetTop;
        const containerTop = container.scrollTop;
        const containerHeight = container.clientHeight;
        
        if (elementTop < containerTop || elementTop > containerTop + containerHeight) {
            container.scrollTo({
                top: elementTop - 20,
                behavior: 'smooth'
            });
        }
    },

    countUp(element, from, to, duration = 300) {
        const startTime = Date.now();
        const difference = to - from;
        
        const updateCount = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(from + difference * easeOut);
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(updateCount);
            }
        };
        
        requestAnimationFrame(updateCount);
    },

    confetti(container) {
        const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            const color = colors[Math.floor(Math.random() * colors.length)];
            const left = Math.random() * 100;
            const delay = Math.random() * 0.5;
            
            confetti.style.cssText = `
                position: fixed;
                left: ${left}%;
                top: -10px;
                width: 10px;
                height: 10px;
                background: ${color};
                animation: confetti-fall 3s ease-out ${delay}s forwards;
                z-index: 9999;
                border-radius: 50%;
            `;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3500);
        }
    }
};

// CSS для анімацій
const style = document.createElement('style');
style.textContent = `
    @keyframes confetti-fall {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Ініціалізація теми
document.addEventListener('DOMContentLoaded', () => {
    Theme.init();
});

// Експорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Storage, Theme, Animations };
}
