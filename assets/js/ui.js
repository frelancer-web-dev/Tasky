// ================================================
// UI.JS - Модулі інтерфейсу Tasky
// Об'єднує: search.js, categories.js, dragdrop.js
// ================================================

// ================================================
// SEARCH - Пошук задач
// ================================================

const Search = {
    searchQuery: '',
    
    init() {
        const searchInput = document.getElementById('searchInput');
        const clearBtn = document.getElementById('clearSearch');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.trim();
                this.updateClearButton();
                
                if (window.app) {
                    window.app.render();
                }
            });
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clear();
            });
        }
    },
    
    clear() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
            this.searchQuery = '';
            this.updateClearButton();
            
            if (window.app) {
                window.app.render();
            }
        }
    },
    
    updateClearButton() {
        const clearBtn = document.getElementById('clearSearch');
        if (clearBtn) {
            clearBtn.style.display = this.searchQuery ? 'flex' : 'none';
        }
    },
    
    filterTasks(tasks) {
        if (!this.searchQuery) {
            return tasks;
        }
        
        const query = this.searchQuery.toLowerCase();
        
        return tasks.filter(task => {
            return task.text.toLowerCase().includes(query);
        });
    },
    
    highlightText(text) {
        if (!this.searchQuery) {
            return text;
        }
        
        const regex = new RegExp(`(${this.escapeRegex(this.searchQuery)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    },
    
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },
    
    getQuery() {
        return this.searchQuery;
    },
    
    isActive() {
        return this.searchQuery.length > 0;
    }
};

// ================================================
// CATEGORIES - Категорії задач
// ================================================

const Categories = {
    currentCategory: 'all',
    
    init() {
        const categoryBtns = document.querySelectorAll('.chip[data-category]');
        
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleCategoryChange(btn);
            });
        });
    },
    
    handleCategoryChange(btn) {
        document.querySelectorAll('.chip').forEach(b => {
            b.classList.remove('active');
        });
        
        btn.classList.add('active');
        
        this.currentCategory = btn.dataset.category;
        
        if (window.app) {
            window.app.render();
        }
    },
    
    getCurrentCategory() {
        return this.currentCategory;
    },
    
    filterTasks(tasks) {
        if (this.currentCategory === 'all') {
            return tasks;
        }
        
        return tasks.filter(task => task.category === this.currentCategory);
    },
    
    getCategoryName(category) {
        const names = {
            work: '💼 Робота',
            personal: '👤 Особисте',
            shopping: '🛒 Покупки',
            health: '💪 Здоров\'я',
            study: '📚 Навчання',
            home: '🏠 Дім'
        };
        
        return names[category] || '📋 Без категорії';
    },
    
    getCategoryIcon(category) {
        const icons = {
            work: '💼',
            personal: '👤',
            shopping: '🛒',
            health: '💪',
            study: '📚',
            home: '🏠'
        };
        
        return icons[category] || '📋';
    }
};

// ================================================
// DRAGDROP - Drag and Drop для задач
// ================================================

const DragDrop = {
    draggedElement: null,
    draggedTaskId: null,
    
    init() {
        // Буде викликатися при рендері кожної задачі
    },
    
    makeDraggable(taskElement, taskId) {
        taskElement.draggable = true;
        taskElement.style.cursor = 'grab';
        
        taskElement.addEventListener('dragstart', (e) => {
            this.handleDragStart(e, taskElement, taskId);
        });
        
        taskElement.addEventListener('dragend', (e) => {
            this.handleDragEnd(e, taskElement);
        });
        
        taskElement.addEventListener('dragover', (e) => {
            this.handleDragOver(e, taskElement);
        });
        
        taskElement.addEventListener('drop', (e) => {
            this.handleDrop(e, taskElement, taskId);
        });
        
        taskElement.addEventListener('dragleave', (e) => {
            this.handleDragLeave(e, taskElement);
        });
    },
    
    handleDragStart(e, element, taskId) {
        this.draggedElement = element;
        this.draggedTaskId = taskId;
        
        element.classList.add('dragging');
        element.style.opacity = '0.5';
        
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', element.innerHTML);
        
        setTimeout(() => {
            element.style.cursor = 'grabbing';
        }, 0);
    },
    
    handleDragEnd(e, element) {
        element.classList.remove('dragging');
        element.style.opacity = '1';
        element.style.cursor = 'grab';
        
        document.querySelectorAll('.task-item').forEach(item => {
            item.classList.remove('drag-over');
        });
        
        this.draggedElement = null;
        this.draggedTaskId = null;
    },
    
    handleDragOver(e, element) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        if (element !== this.draggedElement) {
            element.classList.add('drag-over');
        }
        
        return false;
    },
    
    handleDragLeave(e, element) {
        element.classList.remove('drag-over');
    },
    
    handleDrop(e, targetElement, targetTaskId) {
        e.stopPropagation();
        e.preventDefault();
        
        if (this.draggedTaskId === targetTaskId) {
            return false;
        }
        
        this.swapTasks(this.draggedTaskId, targetTaskId);
        
        targetElement.classList.remove('drag-over');
        
        if (window.app) {
            window.app.render();
        }
        
        return false;
    },
    
    swapTasks(taskId1, taskId2) {
        const tasks = Storage.getTasks();
        const index1 = tasks.findIndex(t => t.id === taskId1);
        const index2 = tasks.findIndex(t => t.id === taskId2);
        
        if (index1 === -1 || index2 === -1) return;
        
        [tasks[index1], tasks[index2]] = [tasks[index2], tasks[index1]];
        
        Storage.saveTasks(tasks);
    },
    
    moveTask(taskId, newIndex) {
        const tasks = Storage.getTasks();
        const oldIndex = tasks.findIndex(t => t.id === taskId);
        
        if (oldIndex === -1) return;
        
        const [task] = tasks.splice(oldIndex, 1);
        tasks.splice(newIndex, 0, task);
        
        Storage.saveTasks(tasks);
    },
    
    isSupported() {
        const div = document.createElement('div');
        return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
    }
};

// Ініціалізація
document.addEventListener('DOMContentLoaded', () => {
    Search.init();
    Categories.init();
});

// Експорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Search, Categories, DragDrop };
}
