// i18n.js - Система інтернаціоналізації

const i18n = {
    currentLang: 'en',
    translations: {},
    LANG_KEY: 'tasky_language',
    
    /**
     * Ініціалізація системи перекладів
     */
    async init() {
        const savedLang = this.getSavedLanguage();
        await this.loadLanguage(savedLang);
        this.setupEventListeners();
        
        console.log(`🌍 Мова завантажена: ${this.currentLang}`);
    },
    
    /**
     * Завантажити мову з JSON файлу
     */
    async loadLanguage(lang) {
        try {
            const response = await fetch(`assets/locales/${lang}.json`);
            if (!response.ok) throw new Error('Не вдалося завантажити мову');
            
            this.translations = await response.json();
            this.currentLang = lang;
            this.saveLanguage(lang);
            this.applyTranslations();
            this.updateLanguageButtons();
            
            // Оновлюємо весь інтерфейс
            if (window.app) {
                window.app.render();
            }
            
        } catch (error) {
            console.error('Помилка завантаження мови:', error);
            // Фолбек на англійську
            if (lang !== 'en') {
                await this.loadLanguage('en');
            }
        }
    },
    
    /**
     * Налаштувати обробники подій
     */
    setupEventListeners() {
        // Кнопки перемикання мови
        document.querySelectorAll('[data-lang]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.closest('[data-lang]').dataset.lang;
                this.changeLanguage(lang);
            });
        });
    },
    
    /**
     * Змінити мову
     */
    async changeLanguage(lang) {
        if (lang === this.currentLang) return;
        await this.loadLanguage(lang);
    },
    
    /**
     * Застосувати переклади до DOM
     */
    applyTranslations() {
        // Перекладаємо всі елементи з data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.dataset.i18n;
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });
        
        // Перекладаємо aria-label
        document.querySelectorAll('[data-i18n-aria]').forEach(element => {
            const key = element.dataset.i18nAria;
            element.setAttribute('aria-label', this.t(key));
        });
        
        // Перекладаємо title
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.dataset.i18nTitle;
            element.setAttribute('title', this.t(key));
        });
    },
    
    /**
     * Оновити кнопки мови
     */
    updateLanguageButtons() {
        document.querySelectorAll('[data-lang]').forEach(btn => {
            if (btn.dataset.lang === this.currentLang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },
    
    /**
     * Отримати переклад за ключем
     */
    t(key, params = {}) {
        let translation = this.translations[key] || key;
        
        // Замінюємо плейсхолдери
        Object.keys(params).forEach(param => {
            translation = translation.replace(`{${param}}`, params[param]);
        });
        
        return translation;
    },
    
    /**
     * Отримати переклад з множиною
     */
    plural(key, count) {
        if (this.currentLang === 'uk' || this.currentLang === 'ru') {
            return this.getSlavicPlural(count);
        }
        return count === 1 ? this.t('footer.task') : this.t('footer.tasks');
    },
    
    /**
     * Отримати правильну форму слова для слов'янських мов
     */
    getSlavicPlural(count) {
        const lastDigit = count % 10;
        const lastTwoDigits = count % 100;
        
        if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
            return this.t('footer.tasksMany');
        }
        
        if (lastDigit === 1) {
            return this.t('footer.task');
        }
        
        if (lastDigit >= 2 && lastDigit <= 4) {
            return this.t('footer.tasks');
        }
        
        return this.t('footer.tasksMany');
    },
    
    /**
     * Зберегти мову
     */
    saveLanguage(lang) {
        localStorage.setItem(this.LANG_KEY, lang);
    },
    
    /**
     * Отримати збережену мову
     */
    getSavedLanguage() {
        return localStorage.getItem(this.LANG_KEY) || 'en';
    },
    
    /**
     * Отримати поточну мову
     */
    getCurrentLanguage() {
        return this.currentLang;
    },
    
    /**
     * Отримати доступні мови
     */
    getAvailableLanguages() {
        return [
            { code: 'en', name: 'English', flag: '🇬🇧' },
            { code: 'uk', name: 'Українська', flag: '🇺🇦' },
            { code: 'ru', name: 'Русский', flag: '🇷🇺' }
        ];
    }
};

// Ініціалізація при завантаженні
document.addEventListener('DOMContentLoaded', () => {
    i18n.init();
});

// Експорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = i18n;
}
