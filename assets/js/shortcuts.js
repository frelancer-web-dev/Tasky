// shortcuts.js - Модуль гарячих клавіш

const Shortcuts = {
    enabled: true,
    
    shortcuts: {
        // Ctrl/Cmd + N - Нова задача
        'n': {
            ctrl: true,
            action: () => {
                if (Navigation && Navigation.getCurrentPage() !== 'tasks') {
                    Navigation.navigateTo('tasks');
                }
                setTimeout(() => {
                    const input = document.getElementById('taskInput');
                    if (input) {
                        input.focus();
                        input.select();
                    }
                }, 100);
            },
            description: 'shortcuts.newTask'
        },
        
        // Ctrl/Cmd + K - Пошук
        'k': {
            ctrl: true,
            action: () => {
                if (Navigation && Navigation.getCurrentPage() !== 'tasks') {
                    Navigation.navigateTo('tasks');
                }
                setTimeout(() => {
                    const search = document.getElementById('searchInput');
                    if (search) {
                        search.focus();
                        search.select();
                    }
                }, 100);
            },
            description: 'shortcuts.search'
        },
        
        // Ctrl/Cmd + Z - Скасувати
        'z': {
            ctrl: true,
            action: () => {
                if (EditTask && EditTask.undo) {
                    EditTask.undo();
                }
            },
            description: 'shortcuts.undo'
        },
        
        // Ctrl/Cmd + S - Зберегти (в модалках)
        's': {
            ctrl: true,
            action: (e) => {
                e.preventDefault();
                
                // Зберігаємо в модалці редагування
                const editModal = document.getElementById('editTaskModal');
                if (editModal && editModal.classList.contains('show')) {
                    const saveBtn = document.getElementById('saveEditTask');
                    if (saveBtn) saveBtn.click();
                    return;
                }
                
                // Зберігаємо в модалці деталей
                const taskModal = document.getElementById('taskModal');
                if (taskModal && taskModal.classList.contains('show')) {
                    const saveBtn = document.getElementById('saveTaskDetails');
                    if (saveBtn) saveBtn.click();
                    return;
                }
            },
            description: 'btn.save'
        },
        
        // Escape - Закрити модалки
        'Escape': {
            action: () => {
                // Закриваємо контекстне меню
                const contextMenu = document.getElementById('taskContextMenu');
                if (contextMenu) {
                    contextMenu.remove();
                    return;
                }
                
                // Закриваємо модалки
                const modals = document.querySelectorAll('.modal.show');
                modals.forEach(modal => {
                    modal.classList.remove('show');
                    document.body.style.overflow = '';
                });
            },
            description: 'shortcuts.escape'
        },
        
        // Цифри 1-5 - Швидке перемикання сторінок
        '1': {
            action: () => {
                if (Navigation) Navigation.navigateTo('tasks');
            },
            description: 'nav.tasks'
        },
        
        '2': {
            action: () => {
                if (Navigation) Navigation.navigateTo('calendar');
            },
            description: 'nav.calendar'
        },
        
        '3': {
            action: () => {
                if (Navigation) Navigation.navigateTo('categories');
            },
            description: 'nav.categories'
        },
        
        '4': {
            action: () => {
                if (Navigation) Navigation.navigateTo('statistics');
            },
            description: 'nav.statistics'
        },
        
        '5': {
            action: () => {
                if (Navigation) Navigation.navigateTo('settings');
            },
            description: 'nav.settings'
        },
        
        // Ctrl/Cmd + E - Експорт
        'e': {
            ctrl: true,
            action: () => {
                const exportBtn = document.getElementById('exportBtn');
                if (exportBtn) exportBtn.click();
            },
            description: 'btn.export'
        },
        
        // Ctrl/Cmd + T - Перемикання теми
        't': {
            ctrl: true,
            action: () => {
                if (Theme) Theme.toggle();
            },
            description: 'settings.theme'
        },
        
        // Ctrl/Cmd + / - Показати довідку гарячих клавіш
        '/': {
            ctrl: true,
            action: () => {
                this.showShortcutsHelp();
            },
            description: 'shortcuts.title'
        },
        
        // F1 - Показати довідку
        'F1': {
            action: (e) => {
                e.preventDefault();
                this.showShortcutsHelp();
            },
            description: 'shortcuts.title'
        }
    },
    
    /**
     * Ініціалізація гарячих клавіш
     */
    init() {
        document.addEventListener('keydown', (e) => {
            if (!this.enabled) return;
            
            // Ігноруємо якщо фокус в input/textarea (крім спеціальних комбінацій)
            const isInputFocused = 
                document.activeElement.tagName === 'INPUT' ||
                document.activeElement.tagName === 'TEXTAREA' ||
                document.activeElement.contentEditable === 'true';
            
            const key = e.key;
            const shortcut = this.shortcuts[key];
            
            if (!shortcut) return;
            
            // Перевіряємо чи потрібен Ctrl/Cmd
            const needsCtrl = shortcut.ctrl === true;
            const hasCtrl = e.ctrlKey || e.metaKey;
            
            if (needsCtrl && !hasCtrl) return;
            if (!needsCtrl && hasCtrl && key !== '/') return; // / може бути з Ctrl
            
            // Для Escape і F1 працюємо завжди
            if (key === 'Escape' || key === 'F1') {
                shortcut.action(e);
                return;
            }
            
            // Для Ctrl+S працюємо завжди
            if (key === 's' && hasCtrl) {
                shortcut.action(e);
                return;
            }
            
            // Інші клавіші тільки якщо не в input
            if (isInputFocused && !hasCtrl) return;
            
            e.preventDefault();
            shortcut.action(e);
        });
        
        console.log('⌨️ Гарячі клавіші активовані');
    },
    
    /**
     * Показати довідку гарячих клавіш
     */
    showShortcutsHelp() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.style.zIndex = '20000';
        
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
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
            { key: `${ctrlKey} + /`, desc: i18n.t('shortcuts.title') },
            { key: 'F1', desc: i18n.t('shortcuts.title') }
        ];
        
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
    
    /**
     * Увімкнути/вимкнути гарячі клавіші
     */
    toggle() {
        this.enabled = !this.enabled;
        console.log(`⌨️ Гарячі клавіші ${this.enabled ? 'увімкнено' : 'вимкнено'}`);
    },
    
    /**
     * Додати нову гарячу клавішу
     */
    add(key, action, options = {}) {
        this.shortcuts[key] = {
            action: action,
            ctrl: options.ctrl || false,
            shift: options.shift || false,
            alt: options.alt || false,
            description: options.description || key
        };
    },
    
    /**
     * Видалити гарячу клавішу
     */
    remove(key) {
        delete this.shortcuts[key];
    }
};

// Ініціалізація
document.addEventListener('DOMContentLoaded', () => {
    Shortcuts.init();
});

// Експорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Shortcuts;
}
