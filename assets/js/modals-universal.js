// ================================================
// MODALS-UNIVERSAL.JS - Універсальна модальна система
// Замінює всі окремі модалки одним гнучким рішенням
// ================================================

const UniversalModal = {
    modal: null,
    title: null,
    body: null,
    footer: null,
    currentType: null,
    currentTaskId: null,
    
    init() {
        this.modal = document.getElementById('universalModal');
        this.title = document.getElementById('modalTitle');
        this.body = document.getElementById('modalBody');
        this.footer = document.getElementById('modalFooter');
        
        // Close on overlay click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });
        
        // Close button
        this.modal.querySelector('.modal-close').addEventListener('click', () => this.close());
        
        // Keyboard: ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
        
        console.log('🎭 Universal Modal initialized');
    },
    
    // ================================================
    // TASK DETAILS
    // ================================================
    openTaskDetails(taskId) {
        const task = Storage.getTasks().find(t => t.id === taskId);
        if (!task) return;
        
        this.currentType = 'details';
        this.currentTaskId = taskId;
        
        this.title.textContent = '📝 Деталі задачі';
        
        this.body.innerHTML = `
            <div class="modal-task-text" style="font-size: 1.2rem; margin-bottom: 20px; font-weight: 500;">
                ${this.escapeHtml(task.text)}
            </div>
            
            <div class="modal-info" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 25px;">
                <div class="info-item" style="display: flex; align-items: center; gap: 12px;">
                    <span class="info-label" style="color: var(--text-secondary); font-weight: 500; min-width: 100px;">Пріоритет:</span>
                    ${this.getPriorityBadge(task.priority)}
                </div>
                <div class="info-item" style="display: flex; align-items: center; gap: 12px;">
                    <span class="info-label" style="color: var(--text-secondary); font-weight: 500; min-width: 100px;">Категорія:</span>
                    <span>${Categories?.getCategoryName(task.category) || 'Без категорії'}</span>
                </div>
                <div class="info-item" style="display: flex; align-items: center; gap: 12px;">
                    <span class="info-label" style="color: var(--text-secondary); font-weight: 500; min-width: 100px;">Дедлайн:</span>
                    <span>${task.deadline ? this.formatDate(task.deadline) : 'Не встановлено'}</span>
                </div>
                <div class="info-item" style="display: flex; align-items: center; gap: 12px;">
                    <span class="info-label" style="color: var(--text-secondary); font-weight: 500; min-width: 100px;">Створено:</span>
                    <span>${this.formatDateTime(task.createdAt)}</span>
                </div>
            </div>

            <div class="modal-notes" style="margin-bottom: 25px;">
                <label for="taskNotes" style="display: block; font-weight: 500; margin-bottom: 10px;">Нотатки:</label>
                <textarea 
                    id="taskNotes" 
                    class="task-notes-input"
                    placeholder="Додайте детальний опис або нотатки..."
                    rows="5"
                    style="width: 100%; padding: 14px; background: var(--bg-darker); border: 2px solid var(--border); border-radius: 12px; color: var(--text); font-size: 0.95rem; font-family: inherit; resize: vertical;"
                >${this.escapeHtml(task.notes || '')}</textarea>
            </div>

            <div class="modal-subtasks">
                <h3 style="font-size: 1.1rem; margin-bottom: 15px;">Підзадачі</h3>
                <div id="subtasksList" class="subtasks-list" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px; max-height: 200px; overflow-y: auto;">
                    ${this.renderSubtasks(task.subtasks || [])}
                </div>
                <div class="add-subtask" style="display: flex; gap: 10px;">
                    <input 
                        type="text" 
                        id="subtaskInput" 
                        class="subtask-input"
                        placeholder="Додати підзадачу..."
                        style="flex: 1; padding: 12px 16px; background: var(--bg-darker); border: 2px solid var(--border); border-radius: 10px; color: var(--text); font-size: 0.9rem;"
                    >
                    <button id="addSubtaskBtn" class="btn-add-subtask" style="width: 44px; height: 44px; background: var(--primary); border: none; border-radius: 10px; cursor: pointer; color: white; font-size: 1.5rem;">+</button>
                </div>
            </div>
        `;
        
        this.footer.innerHTML = `
            <button id="saveTaskDetails" class="btn-primary" style="padding: 12px 32px; background: var(--primary); color: white; border: none; border-radius: 10px; font-size: 1rem; font-weight: 600; cursor: pointer;">
                Зберегти
            </button>
        `;
        
        // Event listeners
        document.getElementById('saveTaskDetails').addEventListener('click', () => this.saveTaskDetails());
        document.getElementById('addSubtaskBtn').addEventListener('click', () => this.addSubtask());
        document.getElementById('subtaskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addSubtask();
        });
        
        this.open();
    },
    
    // ================================================
    // EDIT TASK
    // ================================================
    openEditTask(taskId) {
        const task = Storage.getTasks().find(t => t.id === taskId);
        if (!task) return;
        
        this.currentType = 'edit';
        this.currentTaskId = taskId;
        
        this.title.textContent = '✏️ Редагувати задачу';
        
        this.body.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 14px;">
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text);">Текст задачі:</label>
                    <input 
                        type="text" 
                        id="editTaskText" 
                        class="task-input"
                        value="${this.escapeHtml(task.text)}"
                        maxlength="200"
                        style="width: 100%; padding: 14px 18px; background: var(--bg-darker); border: 2px solid var(--border); border-radius: 12px; color: var(--text); font-size: 0.95rem;"
                    >
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text);">Категорія:</label>
                    <select id="editTaskCategory" class="form-select" style="width: 100%; padding: 11px 14px; background: var(--bg-darker); border: 1px solid var(--border); border-radius: 10px; color: var(--text); font-size: 0.88rem;">
                        <option value="">Без категорії</option>
                        <option value="work" ${task.category === 'work' ? 'selected' : ''}>💼 Робота</option>
                        <option value="personal" ${task.category === 'personal' ? 'selected' : ''}>👤 Особисте</option>
                        <option value="shopping" ${task.category === 'shopping' ? 'selected' : ''}>🛒 Покупки</option>
                        <option value="health" ${task.category === 'health' ? 'selected' : ''}>💪 Здоров'я</option>
                        <option value="study" ${task.category === 'study' ? 'selected' : ''}>📚 Навчання</option>
                        <option value="home" ${task.category === 'home' ? 'selected' : ''}>🏠 Дім</option>
                    </select>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text);">Пріоритет:</label>
                    <select id="editTaskPriority" class="form-select" style="width: 100%; padding: 11px 14px; background: var(--bg-darker); border: 1px solid var(--border); border-radius: 10px; color: var(--text); font-size: 0.88rem;">
                        <option value="low" ${task.priority === 'low' ? 'selected' : ''}>🟢 Низький</option>
                        <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>🟡 Середній</option>
                        <option value="high" ${task.priority === 'high' ? 'selected' : ''}>🔴 Високий</option>
                    </select>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text);">Дедлайн:</label>
                    <input 
                        type="date" 
                        id="editTaskDeadline" 
                        class="form-select"
                        value="${task.deadline || ''}"
                        style="width: 100%; padding: 11px 14px; background: var(--bg-darker); border: 1px solid var(--border); border-radius: 10px; color: var(--text); font-size: 0.88rem;"
                    >
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text);">Нотатки:</label>
                    <textarea 
                        id="editTaskNotes" 
                        class="task-notes-input"
                        placeholder="Додайте нотатки..."
                        rows="4"
                        style="width: 100%; padding: 14px; background: var(--bg-darker); border: 2px solid var(--border); border-radius: 12px; color: var(--text); font-size: 0.95rem; font-family: inherit; resize: vertical;"
                    >${this.escapeHtml(task.notes || '')}</textarea>
                </div>
            </div>
        `;
        
        this.footer.innerHTML = `
            <button id="cancelEdit" class="btn-secondary" style="padding: 9px 18px; background: var(--surface-hover); color: var(--text); border: 1px solid var(--border); border-radius: 8px; font-size: 0.88rem; font-weight: 500; cursor: pointer;">
                Скасувати
            </button>
            <button id="saveEdit" class="btn-primary" style="padding: 12px 32px; background: var(--primary); color: white; border: none; border-radius: 10px; font-size: 1rem; font-weight: 600; cursor: pointer;">
                Зберегти
            </button>
        `;
        
        document.getElementById('cancelEdit').addEventListener('click', () => this.close());
        document.getElementById('saveEdit').addEventListener('click', () => this.saveEditedTask());
        
        this.open();
        
        setTimeout(() => {
            document.getElementById('editTaskText').focus();
            document.getElementById('editTaskText').select();
        }, 100);
    },
    
    // ================================================
    // EXPORT
    // ================================================
    openExport() {
        this.currentType = 'export';
        
        this.title.textContent = '💾 Експорт/Імпорт';
        
        this.body.innerHTML = `
            <div class="export-section" style="margin-bottom: 25px;">
                <h3 style="font-size: 1.1rem; margin-bottom: 15px;">Експорт</h3>
                <div class="export-buttons" style="display: flex; flex-direction: column; gap: 10px;">
                    <button id="exportJson" class="btn-export" style="width: 100%; padding: 14px 20px; background: var(--bg-darker); border: 2px solid var(--border); border-radius: 12px; color: var(--text); font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        📄 Експорт JSON
                    </button>
                    <button id="exportCsv" class="btn-export" style="width: 100%; padding: 14px 20px; background: var(--bg-darker); border: 2px solid var(--border); border-radius: 12px; color: var(--text); font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        📊 Експорт CSV
                    </button>
                    <button id="exportTxt" class="btn-export" style="width: 100%; padding: 14px 20px; background: var(--bg-darker); border: 2px solid var(--border); border-radius: 12px; color: var(--text); font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        📝 Експорт TXT
                    </button>
                </div>
            </div>

            <div class="import-section" style="margin-bottom: 25px;">
                <h3 style="font-size: 1.1rem; margin-bottom: 15px;">Імпорт</h3>
                <input type="file" id="importFile" accept=".json,.csv,.txt" style="display: none;">
                <button id="importBtn" class="btn-import" style="width: 100%; padding: 14px 20px; background: var(--bg-darker); border: 2px solid var(--border); border-radius: 12px; color: var(--text); font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;">
                    📥 Імпортувати файл
                </button>
                <p class="import-note" style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 10px; text-align: center;">
                    Підтримуються формати: JSON, CSV, TXT
                </p>
            </div>

            <div class="backup-section">
                <h3 style="font-size: 1.1rem; margin-bottom: 15px;">Бекап</h3>
                <button id="backupBtn" class="btn-backup" style="width: 100%; padding: 14px 20px; background: var(--bg-darker); border: 2px solid var(--border); border-radius: 12px; color: var(--text); font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
                    💾 Створити бекап
                </button>
                <button id="restoreBtn" class="btn-restore" style="width: 100%; padding: 14px 20px; background: var(--bg-darker); border: 2px solid var(--border); border-radius: 12px; color: var(--text); font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;">
                    🔄 Відновити з бекапу
                </button>
            </div>
        `;
        
        this.footer.innerHTML = '';
        
        // Event listeners
        document.getElementById('exportJson').addEventListener('click', () => ExportImport?.exportJSON());
        document.getElementById('exportCsv').addEventListener('click', () => ExportImport?.exportCSV());
        document.getElementById('exportTxt').addEventListener('click', () => ExportImport?.exportTXT());
        document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
        document.getElementById('importFile').addEventListener('change', (e) => ExportImport?.handleImport(e));
        document.getElementById('backupBtn').addEventListener('click', () => ExportImport?.createBackup());
        document.getElementById('restoreBtn').addEventListener('click', () => ExportImport?.restoreBackup());
        
        this.open();
    },
    
    // ================================================
    // HELPERS
    // ================================================
    saveTaskDetails() {
        if (!this.currentTaskId) return;
        
        const tasks = Storage.getTasks();
        const task = tasks.find(t => t.id === this.currentTaskId);
        
        if (task) {
            task.notes = document.getElementById('taskNotes').value;
            Storage.saveTasks(tasks);
            this.close();
            window.app?.showNotification('✅ Зміни збережено');
        }
    },
    
    saveEditedTask() {
        if (!this.currentTaskId) return;
        
        const text = document.getElementById('editTaskText').value.trim();
        
        if (!text) {
            alert('Задача не може бути пустою!');
            return;
        }
        
        const tasks = Storage.getTasks();
        const taskIndex = tasks.findIndex(t => t.id === this.currentTaskId);
        
        if (taskIndex !== -1) {
            tasks[taskIndex] = {
                ...tasks[taskIndex],
                text,
                category: document.getElementById('editTaskCategory').value,
                priority: document.getElementById('editTaskPriority').value,
                deadline: document.getElementById('editTaskDeadline').value || null,
                notes: document.getElementById('editTaskNotes').value.trim(),
                updatedAt: new Date().toISOString()
            };
            
            if (Storage.saveTasks(tasks)) {
                this.close();
                window.app?.render();
                window.app?.showNotification('✅ Задачу оновлено');
                Navigation?.updateTasksCount();
            }
        }
    },
    
    renderSubtasks(subtasks) {
        if (!subtasks || subtasks.length === 0) return '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">Немає підзадач</p>';
        
        return subtasks.map((subtask, index) => `
            <div class="subtask-item ${subtask.completed ? 'completed' : ''}" style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-darker); border-radius: 10px;">
                <div class="subtask-checkbox" onclick="UniversalModal.toggleSubtask(${index})" style="width: 20px; height: 20px; min-width: 20px; border: 2px solid var(--border); border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; ${subtask.completed ? 'background: var(--success); border-color: var(--success);' : ''}">
                    ${subtask.completed ? '<span style="color: white; font-size: 0.8rem;">✓</span>' : ''}
                </div>
                <span class="subtask-text" style="flex: 1; font-size: 0.95rem; ${subtask.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
                    ${this.escapeHtml(subtask.text)}
                </span>
                <button onclick="UniversalModal.deleteSubtask(${index})" style="width: 28px; height: 28px; background: transparent; border: none; border-radius: 6px; cursor: pointer; color: var(--text-secondary); font-size: 1rem;">🗑️</button>
            </div>
        `).join('');
    },
    
    addSubtask() {
        const input = document.getElementById('subtaskInput');
        const text = input.value.trim();
        
        if (!text) return;
        
        const tasks = Storage.getTasks();
        const task = tasks.find(t => t.id === this.currentTaskId);
        
        if (task) {
            if (!task.subtasks) task.subtasks = [];
            task.subtasks.push({ text, completed: false });
            Storage.saveTasks(tasks);
            
            document.getElementById('subtasksList').innerHTML = this.renderSubtasks(task.subtasks);
            input.value = '';
        }
    },
    
    toggleSubtask(index) {
        const tasks = Storage.getTasks();
        const task = tasks.find(t => t.id === this.currentTaskId);
        
        if (task?.subtasks?.[index]) {
            task.subtasks[index].completed = !task.subtasks[index].completed;
            Storage.saveTasks(tasks);
            document.getElementById('subtasksList').innerHTML = this.renderSubtasks(task.subtasks);
        }
    },
    
    deleteSubtask(index) {
        const tasks = Storage.getTasks();
        const task = tasks.find(t => t.id === this.currentTaskId);
        
        if (task?.subtasks) {
            task.subtasks.splice(index, 1);
            Storage.saveTasks(tasks);
            document.getElementById('subtasksList').innerHTML = this.renderSubtasks(task.subtasks);
        }
    },
    
    getPriorityBadge(priority) {
        const labels = {
            high: '<span style="font-size: 0.78rem; padding: 3px 9px; border-radius: 6px; font-weight: 500; background: rgba(239, 68, 68, 0.15); color: var(--danger);">🔴 Високий</span>',
            medium: '<span style="font-size: 0.78rem; padding: 3px 9px; border-radius: 6px; font-weight: 500; background: rgba(245, 158, 11, 0.15); color: var(--warning);">🟡 Середній</span>',
            low: '<span style="font-size: 0.78rem; padding: 3px 9px; border-radius: 6px; font-weight: 500; background: rgba(16, 185, 129, 0.15); color: var(--success);">🟢 Низький</span>'
        };
        return labels[priority] || labels.medium;
    },
    
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('uk-UA', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
    },
    
    formatDateTime(dateString) {
        return new Date(dateString).toLocaleString('uk-UA', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    open() {
        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Focus trap
        const focusable = this.modal.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable.length > 0) {
            focusable[0].focus();
        }
    },
    
    close() {
        this.modal.classList.remove('show');
        document.body.style.overflow = '';
        this.currentType = null;
        this.currentTaskId = null;
    },
    
    isOpen() {
        return this.modal.classList.contains('show');
    }
};

// Ініціалізація
document.addEventListener('DOMContentLoaded', () => {
    UniversalModal.init();
});

// Експорт для compatibility
window.Modal = {
    openTaskModal: (id) => UniversalModal.openTaskDetails(id)
};

window.EditTask = {
    openEditModal: (id) => UniversalModal.openEditTask(id),
    undo: () => console.log('Undo not implemented in Universal Modal')
};

window.ExportImport = {
    openExportModal: () => UniversalModal.openExport()
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UniversalModal;
}
