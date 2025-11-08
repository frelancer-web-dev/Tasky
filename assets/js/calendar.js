// calendar.js - Модуль інтерактивного календаря з редагуванням

const Calendar = {
    currentDate: new Date(),
    selectedDate: null,
    view: 'month',
    
    init() {
        this.setupEventListeners();
        this.render();
    },
    
    setupEventListeners() {
        document.getElementById('calendarPrev')?.addEventListener('click', () => this.navigate(-1));
        document.getElementById('calendarNext')?.addEventListener('click', () => this.navigate(1));
        document.getElementById('calendarToday')?.addEventListener('click', () => this.goToToday());
        document.getElementById('calendarView')?.addEventListener('change', (e) => {
            this.view = e.target.value;
            this.render();
        });
        document.getElementById('closeTaskList')?.addEventListener('click', () => this.closeDateTaskList());
    },
    
    navigate(direction) {
        if (this.view === 'month') {
            this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        } else if (this.view === 'week') {
            this.currentDate.setDate(this.currentDate.getDate() + (direction * 7));
        } else if (this.view === 'day') {
            this.currentDate.setDate(this.currentDate.getDate() + direction);
        }
        
        this.render();
    },
    
    goToToday() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.render();
    },
    
    render() {
        this.updateHeader();
        
        if (this.view === 'month') {
            this.renderMonthView();
        } else if (this.view === 'week') {
            this.renderWeekView();
        } else if (this.view === 'day') {
            this.renderDayView();
        }
    },
    
    updateHeader() {
        const titleEl = document.getElementById('calendarTitle');
        if (!titleEl) return;
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.toLocaleString(i18n.getCurrentLanguage(), { month: 'long' });
        
        if (this.view === 'month') {
            titleEl.textContent = `${month} ${year}`;
        } else if (this.view === 'week') {
            const weekStart = this.getWeekStart(this.currentDate);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            titleEl.textContent = `${this.formatDate(weekStart)} - ${this.formatDate(weekEnd)}`;
        } else if (this.view === 'day') {
            titleEl.textContent = this.formatDateFull(this.currentDate);
        }
    },
    
    renderMonthView() {
        const container = document.getElementById('calendarGrid');
        if (!container) return;
        
        container.className = 'calendar-grid month-view';
        container.innerHTML = '';
        
        const weekdays = this.getWeekdayNames();
        weekdays.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-weekday';
            dayHeader.textContent = day;
            container.appendChild(dayHeader);
        });
        
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const startDate = new Date(firstDay);
        const dayOfWeek = firstDay.getDay();
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate.setDate(startDate.getDate() - daysToSubtract);
        
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dayCell = this.createDayCell(currentDate, this.currentDate.getMonth());
            container.appendChild(dayCell);
        }
    },
    
    createDayCell(date, currentMonth) {
        const cell = document.createElement('div');
        const tasks = this.getTasksForDate(date);
        const isToday = this.isToday(date);
        const isCurrentMonth = date.getMonth() === currentMonth;
        const isSelected = this.selectedDate && this.isSameDay(date, this.selectedDate);
        
        const classes = ['calendar-day'];
        if (!isCurrentMonth) classes.push('other-month');
        if (isToday) classes.push('today');
        if (isSelected) classes.push('selected');
        if (tasks.length > 0) classes.push('has-tasks');
        
        cell.className = classes.join(' ');
        
        cell.innerHTML = `
            <div class="day-number">${date.getDate()}</div>
            ${tasks.length > 0 ? `<div class="day-tasks-count">${tasks.length}</div>` : ''}
            <div class="day-tasks">
                ${this.renderDayTasks(tasks.slice(0, 3))}
            </div>
        `;
        
        cell.addEventListener('click', () => this.selectDate(date));
        
        return cell;
    },
    
    renderDayTasks(tasks) {
        return tasks.map(task => {
            const priorityClass = task.priority || 'medium';
            return `<div class="day-task ${priorityClass}" title="${this.escapeHtml(task.text)}">
                ${this.escapeHtml(task.text)}
            </div>`;
        }).join('');
    },
    
    selectDate(date) {
        this.selectedDate = date;
        this.render();
        this.showDateTaskList(date);
    },
    
    // ================================================
    // DATE TASK LIST - З редагуванням
    // ================================================
    showDateTaskList(date) {
        const panel = document.getElementById('dateTasksPanel');
        if (!panel) return;
        
        const tasks = this.getTasksForDate(date);
        const titleEl = document.getElementById('dateTasksTitle');
        const listEl = document.getElementById('dateTasksList');
        
        if (titleEl) {
            titleEl.textContent = this.formatDateFull(date);
        }
        
        if (listEl) {
            if (tasks.length === 0) {
                listEl.innerHTML = `
                    <div class="empty-date-tasks">
                        <div class="empty-icon">📝</div>
                        <p>${i18n.t('calendar.noTasksForDate')}</p>
                    </div>
                `;
            } else {
                listEl.innerHTML = tasks.map(task => this.renderDateTask(task)).join('');
                
                // Додаємо обробники подій
                listEl.querySelectorAll('.date-task-item').forEach(item => {
                    const taskId = item.dataset.taskId;
                    
                    // Checkbox
                    item.querySelector('.task-checkbox')?.addEventListener('click', () => {
                        if (Storage.toggleTask(taskId)) {
                            this.showDateTaskList(date);
                            this.render();
                            Navigation?.updateTasksCount();
                        }
                    });
                    
                    // Edit button
                    item.querySelector('.btn-task-action')?.addEventListener('click', () => {
                        EditTask?.openEditModal(taskId);
                    });
                });
            }
        }
        
        panel.classList.add('show');
    },
    
    renderDateTask(task) {
        const priorityLabels = {
            high: `🔴 ${i18n.t('task.priority.high')}`,
            medium: `🟡 ${i18n.t('task.priority.medium')}`,
            low: `🟢 ${i18n.t('task.priority.low')}`
        };
        
        return `
            <div class="date-task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-checkbox">
                    <span class="task-checkbox-icon">✓</span>
                </div>
                <div class="task-info">
                    <div class="task-text">${this.escapeHtml(task.text)}</div>
                    <div class="task-meta">
                        <span class="task-priority ${task.priority}">${priorityLabels[task.priority] || ''}</span>
                        ${task.category ? `<span class="task-category">${Categories?.getCategoryIcon(task.category) || '📋'}</span>` : ''}
                    </div>
                </div>
                <button class="btn-task-action" data-action="edit">✏️</button>
            </div>
        `;
    },
    
    closeDateTaskList() {
        const panel = document.getElementById('dateTasksPanel');
        if (panel) {
            panel.classList.remove('show');
        }
        this.selectedDate = null;
        this.render();
    },
    
    renderWeekView() {
        const container = document.getElementById('calendarGrid');
        if (!container) return;
        
        container.className = 'calendar-grid week-view';
        container.innerHTML = '';
        
        const weekStart = this.getWeekStart(this.currentDate);
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            
            const dayColumn = document.createElement('div');
            dayColumn.className = 'week-day-column';
            
            const dayHeader = document.createElement('div');
            dayHeader.className = 'week-day-header';
            dayHeader.innerHTML = `
                <div class="week-day-name">${this.getWeekdayName(date, 'short')}</div>
                <div class="week-day-number ${this.isToday(date) ? 'today' : ''}">${date.getDate()}</div>
            `;
            
            const tasks = this.getTasksForDate(date);
            const tasksList = document.createElement('div');
            tasksList.className = 'week-day-tasks';
            tasksList.innerHTML = tasks.map(task => this.renderWeekTask(task)).join('');
            
            // Додаємо клік на задачі
            tasksList.querySelectorAll('.week-task').forEach(taskEl => {
                taskEl.addEventListener('click', () => {
                    EditTask?.openEditModal(taskEl.dataset.taskId);
                });
            });
            
            dayColumn.appendChild(dayHeader);
            dayColumn.appendChild(tasksList);
            container.appendChild(dayColumn);
        }
    },
    
    renderWeekTask(task) {
        const priorityColor = {
            high: '#ef4444',
            medium: '#f59e0b',
            low: '#10b981'
        };
        
        return `
            <div class="week-task ${task.completed ? 'completed' : ''}" 
                 style="border-left-color: ${priorityColor[task.priority] || '#6366f1'}"
                 data-task-id="${task.id}">
                ${this.escapeHtml(task.text)}
            </div>
        `;
    },
    
    renderDayView() {
        const container = document.getElementById('calendarGrid');
        if (!container) return;
        
        container.className = 'calendar-grid day-view';
        container.innerHTML = '';
        
        const tasks = this.getTasksForDate(this.currentDate);
        
        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="day-view-empty">
                    <div class="empty-icon">📝</div>
                    <h3>${i18n.t('calendar.noTasksForDate')}</h3>
                    <p>${i18n.t('calendar.addTaskForDate')}</p>
                </div>
            `;
        } else {
            const tasksList = document.createElement('div');
            tasksList.className = 'day-view-tasks';
            tasksList.innerHTML = tasks.map(task => this.renderDayViewTask(task)).join('');
            
            // Додаємо обробники
            tasksList.querySelectorAll('.day-view-task').forEach(item => {
                const taskId = item.dataset.taskId;
                
                item.querySelector('.task-checkbox')?.addEventListener('click', () => {
                    if (Storage.toggleTask(taskId)) {
                        this.renderDayView();
                        Navigation?.updateTasksCount();
                    }
                });
                
                item.querySelector('.btn-edit')?.addEventListener('click', () => {
                    EditTask?.openEditModal(taskId);
                });
                
                item.querySelector('.btn-delete')?.addEventListener('click', () => {
                    if (confirm('Видалити задачу?')) {
                        Storage.deleteTask(taskId);
                        this.renderDayView();
                        Navigation?.updateTasksCount();
                    }
                });
            });
            
            container.appendChild(tasksList);
        }
    },
    
    renderDayViewTask(task) {
        const priorityLabels = {
            high: `🔴 ${i18n.t('task.priority.high')}`,
            medium: `🟡 ${i18n.t('task.priority.medium')}`,
            low: `🟢 ${i18n.t('task.priority.low')}`
        };
        
        return `
            <div class="day-view-task ${task.completed ? 'completed' : ''} priority-${task.priority}" 
                 data-task-id="${task.id}">
                <div class="task-checkbox">
                    <span class="task-checkbox-icon">✓</span>
                </div>
                <div class="task-content">
                    <div class="task-text">${this.escapeHtml(task.text)}</div>
                    <div class="task-meta">
                        <span class="task-priority ${task.priority}">${priorityLabels[task.priority] || ''}</span>
                        ${task.category ? `<span class="task-category">${Categories?.getCategoryIcon(task.category) || '📋'} ${Categories?.getCategoryName(task.category) || ''}</span>` : ''}
                    </div>
                    ${task.notes ? `<div class="task-notes">${this.escapeHtml(task.notes)}</div>` : ''}
                </div>
                <div class="task-actions">
                    <button class="btn-edit">✏️</button>
                    <button class="btn-delete">🗑️</button>
                </div>
            </div>
        `;
    },
    
    getTasksForDate(date) {
        if (!Storage) return [];
        
        const allTasks = Storage.getTasks();
        const dateStr = this.dateToString(date);
        
        return allTasks.filter(task => {
            if (!task.deadline) return false;
            const taskDate = new Date(task.deadline);
            return this.dateToString(taskDate) === dateStr;
        });
    },
    
    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = day === 0 ? 6 : day - 1;
        d.setDate(d.getDate() - diff);
        d.setHours(0, 0, 0, 0);
        return d;
    },
    
    getWeekdayNames() {
        const lang = i18n.getCurrentLanguage();
        const weekdays = [];
        const date = new Date(2024, 0, 1); // Понеділок
        
        for (let i = 0; i < 7; i++) {
            weekdays.push(date.toLocaleDateString(lang, { weekday: 'short' }));
            date.setDate(date.getDate() + 1);
        }
        
        return weekdays;
    },
    
    getWeekdayName(date, format = 'long') {
        return date.toLocaleDateString(i18n.getCurrentLanguage(), { weekday: format });
    },
    
    isToday(date) {
        const today = new Date();
        return this.isSameDay(date, today);
    },
    
    isSameDay(date1, date2) {
        return this.dateToString(date1) === this.dateToString(date2);
    },
    
    dateToString(date) {
        return date.toISOString().split('T')[0];
    },
    
    formatDate(date) {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        return `${day}.${month < 10 ? '0' + month : month}`;
    },
    
    formatDateFull(date) {
        const lang = i18n.getCurrentLanguage();
        return date.toLocaleDateString(lang, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    getCalendarStats() {
        const allTasks = Storage.getTasks();
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        
        let tasksThisMonth = 0;
        let completedThisMonth = 0;
        let upcomingTasks = 0;
        
        allTasks.forEach(task => {
            if (!task.deadline) return;
            
            const taskDate = new Date(task.deadline);
            
            if (taskDate.getMonth() === thisMonth && taskDate.getFullYear() === thisYear) {
                tasksThisMonth++;
                if (task.completed) completedThisMonth++;
            }
            
            if (taskDate >= now && !task.completed) {
                upcomingTasks++;
            }
        });
        
        return {
            tasksThisMonth,
            completedThisMonth,
            upcomingTasks,
            completionRate: tasksThisMonth > 0 ? Math.round((completedThisMonth / tasksThisMonth) * 100) : 0
        };
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Calendar;
}
