// navigation.js - Модуль навігації між сторінками

const Navigation = {
    currentPage: 'tasks',
    
    /**
     * Ініціалізація навігації
     */
    init() {
        // Кнопки навігації в sidebar
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                this.navigateTo(page);
            });
        });
        
        // Sidebar toggle для мобільних
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }
        
        // Закриття sidebar при кліку поза ним на мобільних
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                }
            }
        });
        
        // Додаткові кнопки тем
        const themeToggleBtn = document.getElementById('themeToggleBtn');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                Theme.toggle();
            });
        }
        
        // Кнопки експорту в налаштуваннях
        const settingsExportBtn = document.getElementById('settingsExportBtn');
        const settingsImportBtn = document.getElementById('settingsImportBtn');
        const clearAllBtn = document.getElementById('clearAllBtn');
        
        if (settingsExportBtn) {
            settingsExportBtn.addEventListener('click', () => {
                ExportImport.openExportModal();
            });
        }
        
        if (settingsImportBtn) {
            settingsImportBtn.addEventListener('click', () => {
                document.getElementById('importFile').click();
            });
        }
        
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                this.clearAllData();
            });
        }
        
        // Оновлення лічильника в навігації
        this.updateTasksCount();
        
        // Відкрити сторінку за замовчуванням
        this.navigateTo('tasks');
    },
    
    /**
     * Навігація до сторінки
     */
    navigateTo(pageName) {
        // Приховуємо всі сторінки
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active'));
        
        // Показуємо потрібну сторінку
        const targetPage = document.getElementById(`page-${pageName}`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // Оновлюємо активну кнопку в навігації
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            }
        });
        
        // Зберігаємо поточну сторінку
        this.currentPage = pageName;
        
        // Закриваємо sidebar на мобільних
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.remove('open');
        }
        
        // Викликаємо відповідний обробник для сторінки
        this.handlePageLoad(pageName);
    },
    
    /**
     * Обробка завантаження сторінки
     */
    handlePageLoad(pageName) {
        switch(pageName) {
            case 'tasks':
                if (window.app) {
                    window.app.render();
                }
                break;
                
            case 'calendar':
                if (Calendar) {
                    Calendar.init();
                    this.updateCalendarStats();
                }
                break;
                
            case 'categories':
                this.renderCategories();
                break;
                
            case 'statistics':
                this.renderStatistics();
                break;
                
            case 'settings':
                // Налаштування вже відображаються
                break;
        }
    },
    
    /**
     * Відрендерити категорії
     */
    renderCategories() {
        const container = document.getElementById('categoriesGrid');
        if (!container) return;
        
        const tasks = Storage.getTasks();
        
        const categories = [
            { id: 'work', name: '💼 Робота', icon: '💼' },
            { id: 'personal', name: '👤 Особисте', icon: '👤' },
            { id: 'shopping', name: '🛒 Покупки', icon: '🛒' },
            { id: 'health', name: '💪 Здоров\'я', icon: '💪' },
            { id: 'study', name: '📚 Навчання', icon: '📚' },
            { id: 'home', name: '🏠 Дім', icon: '🏠' }
        ];
        
        container.innerHTML = '';
        
        categories.forEach(category => {
            const count = tasks.filter(t => t.category === category.id).length;
            
            const card = document.createElement('div');
            card.className = 'category-card';
            card.innerHTML = `
                <div class="category-icon">${category.icon}</div>
                <div class="category-name">${category.name}</div>
                <div class="category-count">${count} задач</div>
            `;
            
            card.addEventListener('click', () => {
                // Переходимо на сторінку задач з фільтром по категорії
                this.navigateTo('tasks');
                setTimeout(() => {
                    const categoryBtn = document.querySelector(`.chip[data-category="${category.id}"]`);
                    if (categoryBtn) {
                        categoryBtn.click();
                    }
                }, 100);
            });
            
            container.appendChild(card);
        });
    },
    
    /**
     * Відрендерити статистику
     */
    renderStatistics() {
        const container = document.getElementById('statsGrid');
        if (!container) return;
        
        const tasks = Storage.getTasks();
        const stats = this.calculateDetailedStats(tasks);
        
        container.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${stats.total}</div>
                <div class="stat-label">Всього задач</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.completed}</div>
                <div class="stat-label">Виконано</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.active}</div>
                <div class="stat-label">Активних</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.progress}%</div>
                <div class="stat-label">Прогрес</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: var(--danger);">${stats.highPriority}</div>
                <div class="stat-label">Високий пріоритет</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: var(--warning);">${stats.overdue}</div>
                <div class="stat-label">Прострочені</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: var(--success);">${stats.completedToday}</div>
                <div class="stat-label">Виконано сьогодні</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.thisWeek}</div>
                <div class="stat-label">На цьому тижні</div>
            </div>
        `;
    },
    
    /**
     * Розрахувати детальну статистику
     */
    calculateDetailedStats(tasks) {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const active = total - completed;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        const highPriority = tasks.filter(t => t.priority === 'high' && !t.completed).length;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const overdue = tasks.filter(t => {
            if (!t.deadline || t.completed) return false;
            const deadline = new Date(t.deadline);
            deadline.setHours(0, 0, 0, 0);
            return deadline < today;
        }).length;
        
        const completedToday = tasks.filter(t => {
            if (!t.completedAt) return false;
            const completedDate = new Date(t.completedAt);
            completedDate.setHours(0, 0, 0, 0);
            return completedDate.getTime() === today.getTime();
        }).length;
        
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        
        const thisWeek = tasks.filter(t => {
            if (!t.deadline || t.completed) return false;
            const deadline = new Date(t.deadline);
            deadline.setHours(0, 0, 0, 0);
            return deadline >= weekStart && deadline <= today;
        }).length;
        
        return {
            total,
            completed,
            active,
            progress,
            highPriority,
            overdue,
            completedToday,
            thisWeek
        };
    },
    
    /**
     * Відрендерити календар (заглушка)
     */
    updateCalendarStats() {
        if (!Calendar) return;
        
        const stats = Calendar.getCalendarStats();
        
        const monthEl = document.getElementById('calendarStatsMonth');
        const completedEl = document.getElementById('calendarStatsCompleted');
        const upcomingEl = document.getElementById('calendarStatsUpcoming');
        const rateEl = document.getElementById('calendarStatsRate');
        
        if (monthEl) monthEl.textContent = stats.tasksThisMonth;
        if (completedEl) completedEl.textContent = stats.completedThisMonth;
        if (upcomingEl) upcomingEl.textContent = stats.upcomingTasks;
        if (rateEl) rateEl.textContent = stats.completionRate + '%';
    },
    
    /**
     * Оновити лічильник задач в навігації
     */
    updateTasksCount() {
        const badge = document.getElementById('navTasksCount');
        if (badge) {
            const stats = Storage.getStats();
            badge.textContent = stats.active;
        }
    },
    
    /**
     * Очистити всі дані
     */
    clearAllData() {
        const tasks = Storage.getTasks();
        
        if (tasks.length === 0) {
            alert('⚠️ Немає даних для очищення!');
            return;
        }
        
        const confirmMsg = `⚠️ УВАГА: Ви впевнені, що хочете видалити ВСІ дані?\n\n` +
                          `Це видалить ${tasks.length} задач назавжди!\n\n` +
                          `Цю дію НЕМОЖЛИВО скасувати!`;
        
        if (confirm(confirmMsg)) {
            if (confirm('Ви АБСОЛЮТНО впевнені? Це остання можливість відмінити!')) {
                Storage.clearAll();
                
                if (window.app) {
                    window.app.render();
                }
                
                this.updateTasksCount();
                
                alert('✅ Всі дані успішно видалено!');
            }
        }
    },
    
    /**
     * Отримати поточну сторінку
     */
    getCurrentPage() {
        return this.currentPage;
    }
};

// Ініціалізація
document.addEventListener('DOMContentLoaded', () => {
    Navigation.init();
});

// Оновлювати лічильник при змінах
window.addEventListener('storage-updated', () => {
    if (Navigation) {
        Navigation.updateTasksCount();
    }
});

// Експорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navigation;
}
