// export.js - Модуль експорту та імпорту з перевірками

const ExportImport = {
    /**
     * Ініціалізація
     */
    init() {
        const exportBtn = document.getElementById('exportBtn');
        const closeBtn = document.getElementById('closeExportModal');
        const exportModal = document.getElementById('exportModal');
        
        const exportJsonBtn = document.getElementById('exportJsonBtn');
        const exportCsvBtn = document.getElementById('exportCsvBtn');
        const exportTxtBtn = document.getElementById('exportTxtBtn');
        const importBtn = document.getElementById('importBtn');
        const importFile = document.getElementById('importFile');
        const backupBtn = document.getElementById('backupBtn');
        const restoreBtn = document.getElementById('restoreBtn');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.openExportModal());
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeExportModal());
        }
        
        if (exportModal) {
            exportModal.addEventListener('click', (e) => {
                if (e.target === exportModal) {
                    this.closeExportModal();
                }
            });
        }
        
        if (exportJsonBtn) {
            exportJsonBtn.addEventListener('click', () => this.exportJSON());
        }
        
        if (exportCsvBtn) {
            exportCsvBtn.addEventListener('click', () => this.exportCSV());
        }
        
        if (exportTxtBtn) {
            exportTxtBtn.addEventListener('click', () => this.exportTXT());
        }
        
        if (importBtn) {
            importBtn.addEventListener('click', () => importFile.click());
        }
        
        if (importFile) {
            importFile.addEventListener('change', (e) => this.handleImport(e));
        }
        
        if (backupBtn) {
            backupBtn.addEventListener('click', () => this.createBackup());
        }
        
        if (restoreBtn) {
            restoreBtn.addEventListener('click', () => this.restoreBackup());
        }
    },
    
    /**
     * Відкрити модалку
     */
    openExportModal() {
        const modal = document.getElementById('exportModal');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    },
    
    /**
     * Закрити модалку
     */
    closeExportModal() {
        const modal = document.getElementById('exportModal');
        modal.classList.remove('show');
        document.body.style.overflow = '';
    },
    
    /**
     * Експорт в JSON (з перевіркою)
     */
    exportJSON() {
        const tasks = Storage.getTasks();
        
        // Перевірка чи є задачі
        if (!tasks || tasks.length === 0) {
            alert('⚠️ Немає задач для експорту!');
            return;
        }
        
        try {
            const dataStr = JSON.stringify(tasks, null, 2);
            
            // Перевірка чи дані не пошкоджені
            if (!dataStr || dataStr === '[]' || dataStr === 'null') {
                throw new Error('Дані для експорту пошкоджені');
            }
            
            this.downloadFile(dataStr, 'tasky-tasks.json', 'application/json');
            
            if (window.app) {
                window.app.showNotification(`✅ Експортовано ${tasks.length} задач у JSON`);
            }
        } catch (error) {
            console.error('Помилка експорту JSON:', error);
            alert('❌ Помилка при експорті JSON: ' + error.message);
        }
    },
    
    /**
     * Експорт в CSV (з перевіркою)
     */
    exportCSV() {
        const tasks = Storage.getTasks();
        
        // Перевірка чи є задачі
        if (!tasks || tasks.length === 0) {
            alert('⚠️ Немає задач для експорту!');
            return;
        }
        
        try {
            let csv = 'ID,Текст,Виконано,Пріоритет,Категорія,Дедлайн,Створено\n';
            
            tasks.forEach(task => {
                // Перевірка наявності обов'язкових полів
                if (!task.id || !task.text) {
                    console.warn('Пропущено задачу з неповними даними:', task);
                    return;
                }
                
                csv += `"${task.id}",`;
                csv += `"${task.text.replace(/"/g, '""')}",`;
                csv += `"${task.completed ? 'Так' : 'Ні'}",`;
                csv += `"${task.priority || 'medium'}",`;
                csv += `"${task.category || ''}",`;
                csv += `"${task.deadline || ''}",`;
                csv += `"${task.createdAt || new Date().toISOString()}"\n`;
            });
            
            this.downloadFile(csv, 'tasky-tasks.csv', 'text/csv');
            
            if (window.app) {
                window.app.showNotification(`✅ Експортовано ${tasks.length} задач у CSV`);
            }
        } catch (error) {
            console.error('Помилка експорту CSV:', error);
            alert('❌ Помилка при експорті CSV: ' + error.message);
        }
    },
    
    /**
     * Експорт в TXT (з перевіркою)
     */
    exportTXT() {
        const tasks = Storage.getTasks();
        
        // Перевірка чи є задачі
        if (!tasks || tasks.length === 0) {
            alert('⚠️ Немає задач для експорту!');
            return;
        }
        
        try {
            let txt = '═'.repeat(50) + '\n';
            txt += '          📝 TASKY - СПИСОК ЗАДАЧ\n';
            txt += '═'.repeat(50) + '\n\n';
            
            const categories = {
                all: 'ВСІ ЗАДАЧІ',
                work: '💼 РОБОТА',
                personal: '👤 ОСОБИСТЕ',
                shopping: '🛒 ПОКУПКИ',
                health: '💪 ЗДОРОВ\'Я',
                study: '📚 НАВЧАННЯ',
                home: '🏠 ДІМ'
            };
            
            // Групуємо по категоріях
            const grouped = {};
            tasks.forEach(task => {
                // Перевірка наявності тексту задачі
                if (!task.text) {
                    console.warn('Пропущено задачу без тексту:', task);
                    return;
                }
                
                const cat = task.category || 'none';
                if (!grouped[cat]) {
                    grouped[cat] = [];
                }
                grouped[cat].push(task);
            });
            
            // Формуємо текст
            Object.keys(grouped).forEach(category => {
                txt += `\n${categories[category] || 'БЕЗ КАТЕГОРІЇ'}\n`;
                txt += '─'.repeat(50) + '\n';
                
                grouped[category].forEach((task, index) => {
                    const status = task.completed ? '✅' : '⬜';
                    const priority = {
                        high: '🔴',
                        medium: '🟡',
                        low: '🟢'
                    }[task.priority] || '⚪';
                    
                    txt += `${index + 1}. ${status} ${priority} ${task.text}\n`;
                    
                    if (task.deadline) {
                        txt += `   📅 Дедлайн: ${this.formatDate(task.deadline)}\n`;
                    }
                    
                    if (task.notes) {
                        txt += `   📝 ${task.notes}\n`;
                    }
                    
                    txt += '\n';
                });
            });
            
            txt += '\n' + '═'.repeat(50) + '\n';
            txt += `Експортовано: ${new Date().toLocaleString('uk-UA')}\n`;
            txt += `Всього задач: ${tasks.length}\n`;
            
            this.downloadFile(txt, 'tasky-tasks.txt', 'text/plain');
            
            if (window.app) {
                window.app.showNotification(`✅ Експортовано ${tasks.length} задач у TXT`);
            }
        } catch (error) {
            console.error('Помилка експорту TXT:', error);
            alert('❌ Помилка при експорті TXT: ' + error.message);
        }
    },
    
    /**
     * Обробка імпорту (з перевірками)
     */
    handleImport(event) {
        const file = event.target.files[0];
        
        // Перевірка наявності файлу
        if (!file) {
            console.warn('Файл не вибрано');
            return;
        }
        
        // Перевірка розміру файлу (максимум 5 МБ)
        const maxSize = 5 * 1024 * 1024; // 5 MB
        if (file.size > maxSize) {
            alert('❌ Файл занадто великий! Максимальний розмір: 5 МБ');
            event.target.value = '';
            return;
        }
        
        // Перевірка розширення файлу
        const extension = file.name.split('.').pop().toLowerCase();
        const allowedExtensions = ['json', 'csv', 'txt'];
        
        if (!allowedExtensions.includes(extension)) {
            alert('❌ Непідтримуваний формат файлу! Дозволені: JSON, CSV, TXT');
            event.target.value = '';
            return;
        }
        
        const reader = new FileReader();
        
        reader.onerror = () => {
            alert('❌ Помилка читання файлу!');
            event.target.value = '';
        };
        
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                
                // Перевірка чи файл не пустий
                if (!content || content.trim().length === 0) {
                    throw new Error('Файл пустий!');
                }
                
                if (extension === 'json') {
                    this.importJSON(content);
                } else if (extension === 'csv') {
                    this.importCSV(content);
                } else {
                    throw new Error('Непідтримуваний формат файлу');
                }
                
                this.closeExportModal();
            } catch (error) {
                console.error('Помилка імпорту:', error);
                alert('❌ Помилка імпорту: ' + error.message);
            } finally {
                event.target.value = '';
            }
        };
        
        reader.readAsText(file);
    },
    
    /**
     * Імпорт JSON (з перевірками)
     */
    importJSON(content) {
        try {
            const tasks = JSON.parse(content);
            
            // Перевірка структури даних
            if (!Array.isArray(tasks)) {
                throw new Error('Некоректний формат JSON - очікується масив задач');
            }
            
            // Перевірка чи масив не пустий
            if (tasks.length === 0) {
                throw new Error('JSON файл не містить жодної задачі!');
            }
            
            // Валідація кожної задачі
            let validCount = 0;
            const validTasks = tasks.filter(task => {
                // Обов'язкові поля
                if (!task.id || !task.text || typeof task.completed !== 'boolean') {
                    console.warn('Пропущено неправильну задачу:', task);
                    return false;
                }
                
                // Перевірка типів
                if (typeof task.text !== 'string' || task.text.trim().length === 0) {
                    console.warn('Пропущено задачу з некоректним текстом:', task);
                    return false;
                }
                
                validCount++;
                return true;
            });
            
            if (validCount === 0) {
                throw new Error('Жодна задача не пройшла валідацію!');
            }
            
            if (confirm(`Імпортувати ${validCount} задач? Поточні дані будуть збережені.`)) {
                const currentTasks = Storage.getTasks();
                
                // Перевірка на дублікати ID
                const currentIds = new Set(currentTasks.map(t => t.id));
                const uniqueTasks = validTasks.filter(task => {
                    if (currentIds.has(task.id)) {
                        // Генеруємо новий ID для дублікатів
                        task.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                    }
                    return true;
                });
                
                const merged = [...currentTasks, ...uniqueTasks];
                Storage.saveTasks(merged);
                
                if (window.app) {
                    window.app.render();
                    window.app.showNotification(`✅ Імпортовано ${validCount} задач`);
                }
            }
        } catch (error) {
            console.error('Помилка парсингу JSON:', error);
            throw new Error('Некоректний JSON файл: ' + error.message);
        }
    },
    
    /**
     * Імпорт CSV (з перевірками)
     */
    importCSV(content) {
        try {
            const lines = content.split('\n').filter(line => line.trim());
            
            // Перевірка чи є дані
            if (lines.length < 2) {
                throw new Error('CSV файл пустий або містить тільки заголовки!');
            }
            
            const tasks = [];
            let errorCount = 0;
            
            // Пропускаємо заголовок
            for (let i = 1; i < lines.length; i++) {
                try {
                    const values = this.parseCSVLine(lines[i]);
                    
                    // Перевірка мінімальної кількості полів
                    if (values.length < 2) {
                        errorCount++;
                        continue;
                    }
                    
                    // Перевірка тексту задачі
                    const taskText = values[1] ? values[1].trim() : '';
                    if (!taskText) {
                        errorCount++;
                        continue;
                    }
                    
                    tasks.push({
                        id: Date.now().toString() + i,
                        text: taskText,
                        completed: values[2] === 'Так',
                        priority: values[3] || 'medium',
                        category: values[4] || '',
                        deadline: values[5] || null,
                        createdAt: new Date().toISOString()
                    });
                } catch (error) {
                    console.warn(`Помилка обробки рядка ${i}:`, error);
                    errorCount++;
                }
            }
            
            if (tasks.length === 0) {
                throw new Error('Не вдалося імпортувати жодної задачі з CSV!');
            }
            
            const warningMsg = errorCount > 0 
                ? `\n\n⚠️ Пропущено ${errorCount} некоректних рядків`
                : '';
            
            if (confirm(`Імпортувати ${tasks.length} задач?${warningMsg}`)) {
                const currentTasks = Storage.getTasks();
                const merged = [...currentTasks, ...tasks];
                Storage.saveTasks(merged);
                
                if (window.app) {
                    window.app.render();
                    window.app.showNotification(`✅ Імпортовано ${tasks.length} задач з CSV`);
                }
            }
        } catch (error) {
            console.error('Помилка обробки CSV:', error);
            throw new Error('Некоректний CSV файл: ' + error.message);
        }
    },
    
    /**
     * Створити бекап (з перевіркою)
     */
    createBackup() {
        const tasks = Storage.getTasks();
        
        // Перевірка чи є що бекапити
        if (!tasks || tasks.length === 0) {
            alert('⚠️ Немає задач для створення бекапу!');
            return;
        }
        
        try {
            const backup = {
                tasks: tasks,
                theme: Theme.getTheme(),
                timestamp: new Date().toISOString(),
                version: '2.0',
                tasksCount: tasks.length
            };
            
            const dataStr = JSON.stringify(backup, null, 2);
            
            // Перевірка розміру даних
            if (dataStr.length > 10 * 1024 * 1024) { // 10 MB
                alert('⚠️ Розмір бекапу занадто великий!');
                return;
            }
            
            const timestamp = new Date().toISOString().split('T')[0];
            this.downloadFile(dataStr, `tasky-backup-${timestamp}.json`, 'application/json');
            
            if (window.app) {
                window.app.showNotification(`✅ Бекап створено (${tasks.length} задач)`);
            }
        } catch (error) {
            console.error('Помилка створення бекапу:', error);
            alert('❌ Помилка створення бекапу: ' + error.message);
        }
    },
    
    /**
     * Відновити з бекапу (з перевірками)
     */
    restoreBackup() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Перевірка розміру
            if (file.size > 10 * 1024 * 1024) { // 10 MB
                alert('❌ Файл бекапу занадто великий!');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const backup = JSON.parse(event.target.result);
                    
                    // Перевірка структури бекапу
                    if (!backup.tasks || !Array.isArray(backup.tasks)) {
                        throw new Error('Некоректний формат бекапу - відсутній масив задач');
                    }
                    
                    // Перевірка чи бекап не пустий
                    if (backup.tasks.length === 0) {
                        throw new Error('Бекап не містить жодної задачі!');
                    }
                    
                    // Перевірка версії (опціонально)
                    if (backup.version && backup.version !== '2.0') {
                        console.warn('Увага: версія бекапу відрізняється від поточної');
                    }
                    
                    const confirmMsg = `Відновити з бекапу?\n\n` +
                                     `📦 Задач у бекапі: ${backup.tasks.length}\n` +
                                     `📅 Дата створення: ${new Date(backup.timestamp).toLocaleString('uk-UA')}\n\n` +
                                     `⚠️ УВАГА: Поточні дані будуть ПОВНІСТЮ замінені!`;
                    
                    if (confirm(confirmMsg)) {
                        Storage.saveTasks(backup.tasks);
                        
                        if (backup.theme) {
                            Theme.applyTheme(backup.theme);
                        }
                        
                        if (window.app) {
                            window.app.render();
                            window.app.showNotification(`✅ Бекап відновлено (${backup.tasks.length} задач)`);
                        }
                        
                        this.closeExportModal();
                    }
                } catch (error) {
                    console.error('Помилка відновлення бекапу:', error);
                    alert('❌ Помилка відновлення: ' + error.message);
                }
            };
            
            reader.onerror = () => {
                alert('❌ Помилка читання файлу бекапу!');
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    },
    
    /**
     * Завантажити файл
     */
    downloadFile(content, filename, type) {
        try {
            const blob = new Blob([content], { type: type });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Помилка завантаження файлу:', error);
            alert('❌ Помилка завантаження файлу: ' + error.message);
        }
    },
    
    /**
     * Парсинг CSV рядка
     */
    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        values.push(current);
        return values.map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'));
    },
    
    /**
     * Форматувати дату
     */
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Некоректна дата';
            }
            return date.toLocaleDateString('uk-UA');
        } catch (error) {
            return 'Некоректна дата';
        }
    }
};

// Ініціалізація
document.addEventListener('DOMContentLoaded', () => {
    ExportImport.init();
});

// Експорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExportImport;
}
