// app.js - Головна логіка додатку Tasky з оптимізованим context menu

class TaskyApp {
    constructor() {
        this.currentFilter = 'all';
        this.currentSort = 'createdAt';
        this.initElements();
        this.attachEventListeners();
        this.render();
        console.log('✅ Tasky запущено!');
    }

    initElements() {
        this.taskForm = document.getElementById('taskForm');
        this.taskInput = document.getElementById('taskInput');
        this.categorySelect = document.getElementById('categorySelect');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.deadlineInput = document.getElementById('deadlineInput');
        this.tasksList = document.getElementById('tasksList');
        this.emptyState = document.getElementById('emptyState');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.sortSelect = document.getElementById('sortSelect');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.totalTasksSpan = document.getElementById('totalTasks');
        this.allCountSpan = document.getElementById('allCount');
        this.activeCountSpan = document.getElementById('activeCount');
        this.completedCountSpan = document.getElementById('completedCount');
    }

    attachEventListeners() {
        if (this.taskForm) {
            this.taskForm.addEventListener('submit', (e) => this.handleAddTask(e));
        }
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => this.handleFilterChange(btn));
        });
        
        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', () => this.handleSortChange());
        }
        
        if (this.clearCompletedBtn) {
            this.clearCompletedBtn.addEventListener('click', () => this.handleClearCompleted());
        }
        
        const categoryChips = document.querySelectorAll('.chip');
        categoryChips.forEach(chip => {
            chip.addEventListener('click', () => this.handleCategoryChip(chip));
        });
        
        // Close context menu on click outside
        document.addEventListener('click', (e) => {
            const contextMenu = document.getElementById('taskContextMenu');
            if (contextMenu && !contextMenu.contains(e.target)) {
                contextMenu.remove();
            }
        });
        
        this.taskInput?.focus();
    }

    handleCategoryChip(chip) {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        
        if (Categories) {
            Categories.currentCategory = chip.dataset.category;
        }
        
        this.render();
    }

    handleAddTask(e) {
        e.preventDefault();
        
        const text = this.taskInput.value.trim();
        const priority = this.prioritySelect.value;
        const deadline = this.deadlineInput.value || null;
        const category = this.categorySelect.value;
        
        if (!text) {
            Animations?.showError(this.taskInput);
            alert(i18n.t('error.emptyTask'));
            return;
        }
        
        if (text.length > 200) {
            alert(i18n.t('error.taskTooLong'));
            return;
        }
        
        const task = Storage.addTask(text, priority, deadline, category);
        
        if (task) {
            Animations?.buttonSuccess(this.taskForm.querySelector('.btn-primary'));
            
            this.taskInput.value = '';
            this.prioritySelect.value = 'medium';
            this.deadlineInput.value = '';
            this.categorySelect.value = '';
            
            this.render();
            Navigation?.updateTasksCount();
            this.showNotification(i18n.t('notify.taskAdded'));
            
            setTimeout(() => {
                const newTaskElement = document.querySelector(`[data-task-id="${task.id}"]`);
                if (newTaskElement && Animations) {
                    Animations.scrollToElement(newTaskElement, this.tasksList.parentElement);
                }
            }, 100);
        }
    }

    handleDeleteTask(id) {
        const taskElement = document.querySelector(`[data-task-id="${id}"]`);
        
        if (taskElement) {
            // Зберігаємо для undo
            const task = Storage.getTasks().find(t => t.id === id);
            if (task && EditTask) {
                EditTask.addToHistory('delete', JSON.parse(JSON.stringify(task)));
            }
            
            if (Animations) {
                Animations.removeTask(taskElement, () => {
                    Storage.deleteTask(id);
                    this.render();
                    Navigation?.updateTasksCount();
                    this.showNotification(i18n.t('notify.taskDeleted'));
                });
            } else {
                Storage.deleteTask(id);
                this.render();
                Navigation?.updateTasksCount();
                this.showNotification(i18n.t('notify.taskDeleted'));
            }
        }
    }

    handleToggleTask(id) {
        const taskElement = document.querySelector(`[data-task-id="${id}"]`);
        
        if (Storage.toggleTask(id)) {
            Animations?.toggleTask(taskElement);
            
            setTimeout(() => {
                this.render();
                Navigation?.updateTasksCount();
                
                const stats = Storage.getStats();
                if (stats.total > 0 && stats.completed === stats.total && Animations) {
                    Animations.confetti(this.tasksList);
                }
            }, 300);
        }
    }

    handleFilterChange(btn) {
        this.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        Animations?.pulse(btn);
        
        this.currentFilter = btn.dataset.filter;
        this.render();
    }

    handleSortChange() {
        this.currentSort = this.sortSelect.value;
        this.render();
    }

    handleClearCompleted() {
        const stats = Storage.getStats();
        
        if (stats.completed === 0) return;
        
        const confirmMsg = i18n.t('confirm.deleteCompleted', { count: stats.completed });
        
        if (confirm(confirmMsg)) {
            const count = Storage.clearCompleted();
            
            if (count > 0) {
                this.render();
                Navigation?.updateTasksCount();
                this.showNotification(i18n.t('notify.cleared', { count }));
            }
        }
    }

    getFilteredTasks() {
        let tasks = Storage.getTasks();
        
        if (Search?.isActive()) {
            tasks = Search.filterTasks(tasks);
        }
        
        if (Categories && Categories.getCurrentCategory() !== 'all') {
            tasks = Categories.filterTasks(tasks);
        }
        
        switch (this.currentFilter) {
            case 'active':
                tasks = tasks.filter(task => !task.completed);
                break;
            case 'completed':
                tasks = tasks.filter(task => task.completed);
                break;
        }
        
        return this.sortTasks(tasks);
    }

    sortTasks(tasks) {
        const sorted = [...tasks];
        
        switch (this.currentSort) {
            case 'priority':
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                sorted.sort((a, b) => priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium']);
                break;
                
            case 'deadline':
                sorted.sort((a, b) => {
                    if (!a.deadline && !b.deadline) return 0;
                    if (!a.deadline) return 1;
                    if (!b.deadline) return -1;
                    return new Date(a.deadline) - new Date(b.deadline);
                });
                break;
                
            case 'alphabetical':
                sorted.sort((a, b) => a.text.localeCompare(b.text, i18n.getCurrentLanguage()));
                break;
                
            case 'createdAt':
            default:
                sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
        }
        
        return sorted;
    }

    createTaskHTML(task) {
        const li = document.createElement('li');
        
        const classes = ['task-item'];
        if (task.completed) classes.push('completed');
        if (task.priority) classes.push(`priority-${task.priority}`);
        if (this.isOverdue(task)) classes.push('overdue');
        
        li.className = classes.join(' ');
        li.dataset.taskId = task.id;
        
        let taskText = this.escapeHtml(task.text);
        if (Search?.isActive()) {
            taskText = Search.highlightText(taskText);
        }
        
        li.innerHTML = `
            <div class="task-checkbox">
                <span class="task-checkbox-icon">✓</span>
            </div>
            <div class="task-content">
                <span class="task-text">${taskText}</span>
                <div class="task-meta">
                    ${this.getCategoryBadge(task.category)}
                    ${this.getPriorityBadge(task.priority)}
                    ${this.getDeadlineBadge(task.deadline)}
                </div>
            </div>
            <div class="task-actions">
                <button class="btn-edit" aria-label="${i18n.t('aria.editTask')}">✏️</button>
                <button class="btn-delete" aria-label="${i18n.t('aria.deleteTask')}">🗑️</button>
            </div>
        `;
        
        const checkbox = li.querySelector('.task-checkbox');
        const editBtn = li.querySelector('.btn-edit');
        const deleteBtn = li.querySelector('.btn-delete');
        
        checkbox.addEventListener('click', () => this.handleToggleTask(task.id));
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            EditTask?.openEditModal(task.id);
        });
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleDeleteTask(task.id);
        });
        
        if (Animations) {
            checkbox.addEventListener('click', (e) => Animations.ripple(e, checkbox));
        }
        
        if (DragDrop?.isSupported()) {
            DragDrop.makeDraggable(li, task.id);
        }
        
        // Подвійний клік для швидкого редагування
        const taskTextEl = li.querySelector('.task-text');
        taskTextEl.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.handleQuickEditText(task.id, taskTextEl);
        });
        
        // Правий клік для контекстного меню (ОПТИМІЗОВАНИЙ)
        li.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e, task);
        });
        
        return li;
    }

    handleQuickEditText(taskId, textElement) {
        const task = Storage.getTasks().find(t => t.id === taskId);
        if (!task || task.completed) return;
        
        const originalText = task.text;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = originalText;
        input.className = 'task-input';
        input.style.cssText = 'padding: 8px 12px; font-size: 0.95rem; width: 100%; border-radius: 6px;';
        
        textElement.innerHTML = '';
        textElement.appendChild(input);
        input.focus();
        input.select();
        
        const save = () => {
            const newText = input.value.trim();
            
            if (!newText) {
                alert(i18n.t('error.emptyTask'));
                input.focus();
                return;
            }
            
            if (newText !== originalText) {
                if (EditTask?.quickEdit(taskId, 'text', newText)) {
                    this.render();
                    this.showNotification(i18n.t('notify.taskUpdated') || '✅ Задачу оновлено');
                }
            } else {
                textElement.innerHTML = this.escapeHtml(originalText);
            }
        };
        
        const cancel = () => {
            textElement.innerHTML = this.escapeHtml(originalText);
        };
        
        input.addEventListener('blur', save);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                save();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancel();
            }
        });
    }

    // ================================================
    // CONTEXT MENU - Оптимізована версія з CSS класами
    // ================================================
    showContextMenu(event, task) {
        const existingMenu = document.getElementById('taskContextMenu');
        existingMenu?.remove();
        
        const menu = document.createElement('div');
        menu.id = 'taskContextMenu';
        menu.className = 'context-menu';
        menu.style.top = event.clientY + 'px';
        menu.style.left = event.clientX + 'px';
        
        const menuItems = [
            {
                icon: '✏️',
                text: i18n.t('btn.edit'),
                action: () => {
                    EditTask?.openEditModal(task.id);
                    menu.remove();
                }
            },
            {
                icon: task.completed ? '⬜' : '✅',
                text: task.completed ? 'Позначити активною' : 'Виконати',
                action: () => {
                    this.handleToggleTask(task.id);
                    menu.remove();
                }
            },
            {
                icon: '📋',
                text: 'Дублювати',
                action: () => {
                    EditTask?.duplicateTask(task.id);
                    menu.remove();
                }
            },
            {
                icon: '📝',
                text: 'Деталі',
                action: () => {
                    Modal?.openTaskModal(task.id);
                    menu.remove();
                }
            },
            { divider: true },
            {
                icon: '🗑️',
                text: i18n.t('btn.delete'),
                danger: true,
                action: () => {
                    this.handleDeleteTask(task.id);
                    menu.remove();
                }
            }
        ];
        
        menuItems.forEach(item => {
            if (item.divider) {
                const divider = document.createElement('div');
                divider.className = 'context-menu-divider';
                menu.appendChild(divider);
            } else {
                const btn = document.createElement('button');
                btn.className = `context-menu-item${item.danger ? ' danger' : ''}`;
                btn.innerHTML = `${item.icon} <span>${item.text}</span>`;
                btn.addEventListener('click', item.action);
                menu.appendChild(btn);
            }
        });
        
        document.body.appendChild(menu);
        
        // Adjust position if menu goes off screen
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            menu.style.left = (event.clientX - rect.width) + 'px';
        }
        if (rect.bottom > window.innerHeight) {
            menu.style.top = (event.clientY - rect.height) + 'px';
        }
    }

    getCategoryBadge(category) {
        if (!category) return '';
        const icon = Categories?.getCategoryIcon(category) || '📋';
        return `<span class="task-category ${category}">${icon}</span>`;
    }

    getPriorityBadge(priority) {
        if (!priority) return '';
        
        const labels = {
            high: `🔴 ${i18n.t('task.priority.high')}`,
            medium: `🟡 ${i18n.t('task.priority.medium')}`,
            low: `🟢 ${i18n.t('task.priority.low')}`
        };
        
        return `<span class="task-priority ${priority}">${labels[priority]}</span>`;
    }

    getDeadlineBadge(deadline) {
        if (!deadline) return '';
        
        const deadlineDate = new Date(deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        deadlineDate.setHours(0, 0, 0, 0);
        
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let classes = 'task-deadline';
        let icon = '📅';
        let text = this.formatDate(deadline);
        
        if (diffDays < 0) {
            classes += ' overdue';
            icon = '⚠️';
            text = `${i18n.t('task.deadline.overdue')} (${Math.abs(diffDays)}д)`;
        } else if (diffDays === 0) {
            classes += ' today';
            icon = '⏰';
            text = i18n.t('task.deadline.today');
        } else if (diffDays === 1) {
            icon = '📌';
            text = i18n.t('task.deadline.tomorrow');
        } else if (diffDays <= 3) {
            icon = '📌';
            text = i18n.t('task.deadline.days', { days: diffDays });
        }
        
        return `<span class="${classes}">${icon} ${text}</span>`;
    }

    isOverdue(task) {
        if (!task.deadline || task.completed) return false;
        
        const deadline = new Date(task.deadline);
        const today = new Date();
        deadline.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        
        return deadline < today;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        return `${day}.${month < 10 ? '0' + month : month}`;
    }

    updateCounters() {
        const stats = Storage.getStats();
        
        if (this.allCountSpan) this.allCountSpan.textContent = stats.total;
        if (this.activeCountSpan) this.activeCountSpan.textContent = stats.active;
        if (this.completedCountSpan) this.completedCountSpan.textContent = stats.completed;
        
        const taskWord = i18n.plural('footer.task', stats.total);
        if (this.totalTasksSpan) {
            this.totalTasksSpan.textContent = i18n.t('footer.total', { 
                count: stats.total, 
                word: taskWord 
            });
        }
        
        if (this.clearCompletedBtn) {
            this.clearCompletedBtn.disabled = stats.completed === 0;
        }
    }

    toggleEmptyState() {
        const tasks = this.getFilteredTasks();
        
        if (!this.emptyState || !this.tasksList) return;
        
        if (tasks.length === 0) {
            this.emptyState.classList.add('show');
            this.tasksList.style.display = 'none';
        } else {
            this.emptyState.classList.remove('show');
            this.tasksList.style.display = 'flex';
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--success);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 20px var(--shadow);
            z-index: 10000;
            font-weight: 500;
            animation: slideIn 0.3s ease-out, fadeOut 0.3s ease-out 2.7s;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    render() {
        if (!this.tasksList) return;
        
        this.tasksList.innerHTML = '';
        
        const tasks = this.getFilteredTasks();
        
        tasks.forEach((task, index) => {
            const taskElement = this.createTaskHTML(task);
            this.tasksList.appendChild(taskElement);
            
            if (Animations) {
                setTimeout(() => {
                    Animations.addTask(taskElement);
                }, index * 50);
            }
        });
        
        this.updateCounters();
        this.toggleEmptyState();
    }
}

// Ініціалізація
document.addEventListener('DOMContentLoaded', () => {
    const initApp = () => {
        if (typeof i18n !== 'undefined' && i18n.translations && Object.keys(i18n.translations).length > 0) {
            window.app = new TaskyApp();
        } else {
            setTimeout(initApp, 100);
        }
    };
    
    initApp();
});

window.addEventListener('beforeunload', () => {
    console.log('👋 До побачення!');
});
