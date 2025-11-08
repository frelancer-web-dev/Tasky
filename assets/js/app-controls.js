// ================================================
// APP-CONTROLS.JS - Навігація та гарячі клавіші
// Оптимізована версія з чистішим mobile menu
// ================================================

// ================================================
// MOBILE MENU - Спрощений контроль
// ================================================
const MobileMenu = {
    sidebar: null,
    overlay: null,
    isOpen: false,
    
    init() {
        this.sidebar = document.getElementById('sidebar');
        this.overlay = document.getElementById('sidebarOverlay');
        const hamburger = document.getElementById('hamburgerBtn');
        const mobileTheme = document.getElementById('mobileThemeBtn');
        
        if (!this.sidebar || !this.overlay) return;
        
        // Hamburger click
        hamburger?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });
        
        // Overlay click
        this.overlay.addEventListener('click', () => this.close());
        
        // Mobile theme button
        mobileTheme?.addEventListener('click', () => Theme?.toggle());
        
        // Close on nav item click (mobile only)
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    setTimeout(() => this.close(), 300);
                }
            });
        });
        
        // Close on resize to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isOpen) {
                this.close();
            }
        });
        
        console.log('📱 Mobile menu initialized');
    },
    
    toggle() {
        this.isOpen ? this.close() : this.open();
    },
    
    open() {
        this.sidebar.classList.add('open');
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.isOpen = true;
    },
    
    close() {
        this.sidebar.classList.remove('open');
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
        this.isOpen = false;
    }
};

// ================================================
// NAVIGATION - Навігація між сторінками
// ================================================
const Navigation = {
    currentPage: 'tasks',
    
    init() {
        // Nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                this.navigateTo(item.dataset.page);
            });
        });
        
        // Desktop theme toggle
        const themeToggle = document.getElementById('themeToggleBtn');
        themeToggle?.addEventListener('click', () => Theme?.toggle());
        
        // Settings buttons
        this.initSettingsButtons();
        
        // Initial render
        this.updateTasksCount();
        this.navigateTo('tasks');
    },
    
    initSettingsButtons() {
        const exportBtn = document.getElementById('settingsExportBtn');
        const importBtn = document.getElementById('settingsImportBtn');
        const clearBtn = document.getElementById('clearAllBtn');
        
        exportBtn?.addEventListener('click', () => ExportImport?.openExportModal());
        importBtn?.addEventListener('click', () => document.getElementById('importFile')?.click());
        clearBtn?.addEventListener('click', () => this.clearAllData());
    },
    
    navigateTo(pageName) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show target page
        const targetPage = document.getElementById(`page-${pageName}`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // Update nav buttons
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === pageName);
        });
        
        this.currentPage = pageName;
        this.handlePageLoad(pageName);
    },
    
    handlePageLoad(pageName) {
        switch(pageName) {
            case 'tasks':
                window.app?.render();
                break;
                
            case 'calendar':
                Calendar?.init();
                this.updateCalendarStats();
                break;
                
            case 'categories':
                this.renderCategories();
                break;
                
            case 'statistics':
                this.renderStatistics();
                break;
        }
    },
    
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
        
        container.innerHTML = categories.map(cat => {
            const count = tasks.filter(t => t.category === cat.id).length;
            return `
                <div class="category-card" data-category="${cat.id}">
                    <div class="category-icon">${cat.icon}</div>
                    <div class="category-name">${cat.name}</div>
                    <div class="category-count">${count} задач</div>
                </div>
            `;
        }).join('');
        
        // Add click handlers
        container.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                this.navigateTo('tasks');
                setTimeout(() => {
                    document.querySelector(`.chip[data-category="${card.dataset.category}"]`)?.click();
                }, 100);
            });
        });
    },
    
    renderStatistics() {
        const container = document.getElementById('statsGrid');
        if (!container) return;
        
        const stats = this.calculateStats(Storage.getTasks());
        
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
    
    calculateStats(tasks) {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const today = new Date().setHours(0, 0, 0, 0);
        
        return {
            total,
            completed,
            active: total - completed,
            progress: total > 0 ? Math.round((completed / total) * 100) : 0,
            highPriority: tasks.filter(t => t.priority === 'high' && !t.completed).length,
            overdue: tasks.filter(t => {
                if (!t.deadline || t.completed) return false;
                return new Date(t.deadline).setHours(0, 0, 0, 0) < today;
            }).length,
            completedToday: tasks.filter(t => {
                if (!t.completedAt) return false;
                return new Date(t.completedAt).setHours(0, 0, 0, 0) === today;
            }).length,
            thisWeek: tasks.filter(t => {
                if (!t.deadline || t.completed) return false;
                const weekStart = new Date(today);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                const deadline = new Date(t.deadline).setHours(0, 0, 0, 0);
                return deadline >= weekStart && deadline <= today;
            }).length
        };
    },
    
    updateCalendarStats() {
        if (!Calendar) return;
        
        const stats = Calendar.getCalendarStats();
        const elements = {
            month: document.getElementById('calendarStatsMonth'),
            completed: document.getElementById('calendarStatsCompleted'),
            upcoming: document.getElementById('calendarStatsUpcoming'),
            rate: document.getElementById('calendarStatsRate')
        };
        
        if (elements.month) elements.month.textContent = stats.tasksThisMonth;
        if (elements.completed) elements.completed.textContent = stats.completedThisMonth;
        if (elements.upcoming) elements.upcoming.textContent = stats.upcomingTasks;
        if (elements.rate) elements.rate.textContent = stats.completionRate + '%';
    },
    
    updateTasksCount() {
        const badge = document.getElementById('navTasksCount');
        if (badge) {
            badge.textContent = Storage.getStats().active;
        }
    },
    
    clearAllData() {
        const tasks = Storage.getTasks();
        
        if (tasks.length === 0) {
            alert('⚠️ Немає даних для очищення!');
            return;
        }
        
        if (confirm(`⚠️ УВАГА: Видалити ${tasks.length} задач назавжди?\n\nЦю дію НЕМОЖЛИВО скасувати!`)) {
            if (confirm('Ви АБСОЛЮТНО впевнені? Це остання можливість відмінити!')) {
                Storage.clearAll();
                window.app?.render();
                this.updateTasksCount();
                alert('✅ Всі дані успішно видалено!');
            }
        }
    },
    
    getCurrentPage() {
        return this.currentPage;
    }
};

// ================================================
// SHORTCUTS - Гарячі клавіші
// ================================================
const Shortcuts = {
    enabled: true,
    
    shortcuts: {
        'n': { ctrl: true, action: () => this.focusTaskInput(), desc: 'shortcuts.newTask' },
        'k': { ctrl: true, action: () => this.focusSearch(), desc: 'shortcuts.search' },
        'z': { ctrl: true, action: () => EditTask?.undo(), desc: 'shortcuts.undo' },
        's': { ctrl: true, action: (e) => this.handleSave(e), desc: 'btn.save' },
        'Escape': { action: () => this.handleEscape(), desc: 'shortcuts.escape' },
        '1': { action: () => Navigation.navigateTo('tasks'), desc: 'nav.tasks' },
        '2': { action: () => Navigation.navigateTo('calendar'), desc: 'nav.calendar' },
        '3': { action: () => Navigation.navigateTo('categories'), desc: 'nav.categories' },
        '4': { action: () => Navigation.navigateTo('statistics'), desc: 'nav.statistics' },
        '5': { action: () => Navigation.navigateTo('settings'), desc: 'nav.settings' },
        'e': { ctrl: true, action: () => document.getElementById('exportBtn')?.click(), desc: 'btn.export' },
        't': { ctrl: true, action: () => Theme?.toggle(), desc: 'settings.theme' },
        '/': { ctrl: true, action: () => this.showHelp(), desc: 'shortcuts.title' },
        'F1': { action: (e) => { e.preventDefault(); this.showHelp(); }, desc: 'shortcuts.title' }
    },
    
    init() {
        document.addEventListener('keydown', (e) => {
            if (!this.enabled) return;
            
            const isInputFocused = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
            const shortcut = this.shortcuts[e.key];
            
            if (!shortcut) return;
            
            const needsCtrl = shortcut.ctrl === true;
            const hasCtrl = e.ctrlKey || e.metaKey;
            
            if (needsCtrl && !hasCtrl) return;
            if (!needsCtrl && hasCtrl && e.key !== '/') return;
            
            // Always handle these keys
            if (['Escape', 'F1'].includes(e.key) || (e.key === 's' && hasCtrl)) {
                shortcut.action(e);
                return;
            }
            
            // Skip if input focused (unless Ctrl pressed)
            if (isInputFocused && !hasCtrl) return;
            
            e.preventDefault();
            shortcut.action(e);
        });
        
        console.log('⌨️ Shortcuts activated');
    },
    
    focusTaskInput() {
        if (Navigation.getCurrentPage() !== 'tasks') {
            Navigation.navigateTo('tasks');
        }
        setTimeout(() => {
            const input = document.getElementById('taskInput');
            input?.focus();
            input?.select();
        }, 100);
    },
    
    focusSearch() {
        if (Navigation.getCurrentPage() !== 'tasks') {
            Navigation.navigateTo('tasks');
        }
        setTimeout(() => {
            const search = document.getElementById('searchInput');
            search?.focus();
            search?.select();
        }, 100);
    },
    
    handleSave(e) {
        e.preventDefault();
        
        const editModal = document.getElementById('editTaskModal');
        if (editModal?.classList.contains('show')) {
            document.getElementById('saveEditTask')?.click();
            return;
        }
        
        const taskModal = document.getElementById('taskModal');
        if (taskModal?.classList.contains('show')) {
            document.getElementById('saveTaskDetails')?.click();
        }
    },
    
    handleEscape() {
        const contextMenu = document.getElementById('taskContextMenu');
        if (contextMenu) {
            contextMenu.remove();
            return;
        }
        
        document.querySelectorAll('.modal.show').forEach(modal => {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        });
    },
    
    showHelp() {
        const isMac = navigator.platform.toUpperCase().includes('MAC');
        const ctrlKey = isMac ? '⌘' : 'Ctrl';
        
        const shortcuts = [
            { key: `${ctrlKey} + N`, desc: i18n.t('shortcuts.newTask') },
            { key: `${ctrlKey} + K`, desc: i18n.t('shortcuts.search') },
            { key: `${ctrlKey} + Z`, desc: i18n.t('shortcuts.undo') },
            { key: `${ctrlKey} + S`, desc: i18n.t('btn.save') },
            { key: `${ctrlKey} + E`, desc: i18n.t('btn.export') },
            { key: `${ctrlKey} + T`, desc: i18n.t('settings.theme') },
            { key: 'Esc', desc: i18n.t('shortcuts.escape') },
            { key: '1-5', desc: 'Швидке перемикання сторінок' },
            { key: `${ctrlKey} + /`, desc: i18n.t('shortcuts.title') }
        ];
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.style.zIndex = '20000';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h2>⌨️ ${i18n.t('shortcuts.title')}</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove(); document.body.style.overflow='';">✕</button>
                </div>
                <div class="modal-body" style="padding: 20px;">
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        ${shortcuts.map(s => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--bg-darker); border-radius: 8px;">
                                <span style="color: var(--text-secondary); font-size: 0.9rem;">${s.desc}</span>
                                <kbd style="background: var(--surface-hover); padding: 4px 10px; border-radius: 6px; font-family: monospace; font-size: 0.85rem; border: 1px solid var(--border);">${s.key}</kbd>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                document.body.style.overflow = '';
            }
        });
    },
    
    toggle() {
        this.enabled = !this.enabled;
        console.log(`⌨️ Shortcuts ${this.enabled ? 'enabled' : 'disabled'}`);
    }
};

// ================================================
// INITIALIZATION
// ================================================
document.addEventListener('DOMContentLoaded', () => {
    MobileMenu.init();
    Navigation.init();
    Shortcuts.init();
});

window.addEventListener('storage-updated', () => {
    Navigation?.updateTasksCount();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MobileMenu, Navigation, Shortcuts };
}
