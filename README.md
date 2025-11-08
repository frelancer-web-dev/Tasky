# 📋 Tasky - Professional Task Manager

> Modern, intuitive task management application with calendar support, categories, and plenty of productivity features.

![Version](https://img.shields.io/badge/version-2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Language](https://img.shields.io/badge/language-JavaScript-yellow)

---

## ✨ Key Features

### 📝 Task Management
- ✅ Create, edit, and delete tasks
- 🎨 **Categories**: Work, Personal, Shopping, Health, Study, Home
- 🚦 **Priorities**: High, Medium, Low
- 📅 Set deadlines
- 📝 Notes and subtasks
- 🔍 Quick search and filtering

### 📆 Calendar
- 📊 Interactive calendar with 3 view modes (month/week/day)
- 📌 Task visualization by dates
- 📈 Completion statistics

### 🎯 Productivity
- 📊 Detailed statistics
- 🔢 Progress tracking
- ⚡ Keyboard shortcuts
- 🎨 Drag & Drop for task reordering

### 🌐 Interface
- 🌙 Dark/Light theme
- 🌍 Multilingual support (UA/EN/RU)
- 📱 Fully responsive design
- ♿ Accessibility (ARIA, screen readers)

### 💾 Data
- 💿 Local storage (localStorage)
- 📤 Export to JSON, CSV, TXT
- 📥 Data import
- 🔄 Backup system

---

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/tasky.git

# Navigate to folder
cd tasky

# Open index.html in browser
open index.html
```

**Or** simply download the ZIP archive and open `index.html`

### System Requirements

- Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript enabled
- Minimum 5 MB free storage space

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + N` | New task |
| `Ctrl/Cmd + K` | Search |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + S` | Save |
| `Ctrl/Cmd + E` | Export |
| `Ctrl/Cmd + T` | Toggle theme |
| `1-5` | Switch pages |
| `Esc` | Close modal |
| `Ctrl/Cmd + /` | Show help |

---

## 🏗️ Project Architecture

```
tasky/
├── index.html              # Main page
├── assets/
│   ├── css/
│   │   ├── main.css       # Core styles
│   │   ├── modal.css      # Modal windows
│   │   ├── animations.css # Animations
│   │   ├── calendar.css   # Calendar
│   │   ├── mobile-*.css   # Mobile styles
│   │   └── loader.css     # Loader
│   ├── js/
│   │   ├── app.js         # Main logic
│   │   ├── core.js        # Storage, Theme, Animations
│   │   ├── i18n.js        # Internationalization
│   │   ├── ui.js          # Search, Categories, DragDrop
│   │   ├── calendar.js    # Calendar
│   │   ├── modals-universal.js # Modals
│   │   ├── export.js      # Export/Import
│   │   └── app-controls.js # Navigation, shortcuts
│   └── locales/
│       ├── en.json        # English
│       ├── uk.json        # Ukrainian
│       └── ru.json        # Russian
└── README.md
```

---

## 🎨 Code Features

### Modular Architecture
```javascript
// Each module handles its own functionality
const Storage = { /* localStorage API */ }
const Theme = { /* Themes */ }
const Animations = { /* Animations */ }
const Calendar = { /* Calendar */ }
```

### Universal Modal System
```javascript
// One modal for all needs
UniversalModal.openTaskDetails(taskId);
UniversalModal.openEditTask(taskId);
UniversalModal.openExport();
```

### Internationalization
```javascript
// Translations loaded dynamically
i18n.t('task.priority.high'); // "High"
i18n.plural('footer.task', 5); // "5 tasks"
```

---

## 📱 Mobile Optimization

- ✅ Touch-friendly interface (44px minimum)
- ✅ Hamburger menu with smooth animation
- ✅ Responsive grid (from 280px to 4K)
- ✅ iOS Safari optimization
- ✅ Safe Area support (iPhone X+)

---

## 🔧 Configuration

### Change Default Theme
```javascript
// Set in localStorage:
localStorage.setItem('tasky_theme', 'light'); // or 'dark'
```

### Change Default Language
```javascript
// Set in localStorage:
localStorage.setItem('tasky_language', 'en'); // en/uk/ru
```

---

## 🐛 Known Limitations

- ❌ No cross-device sync (localStorage)
- ❌ 5-10 MB data limit (browser limitation)
- ❌ No IE11 support

---

## 🛣️ Roadmap

- [ ] 🔐 Authentication and sync
- [ ] 🔔 Push notifications
- [ ] 👥 Shared tasks (teams)
- [ ] 📊 Advanced analytics
- [ ] 🤖 AI assistant for planning
- [ ] 📲 PWA (Progressive Web App)
- [ ] 🌐 Backend API

---

## 🤝 Contributing

Pull Requests are welcome! To add a new feature:

1. Fork the repository
2. Create a branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push: `git push origin feature/AmazingFeature`
5. Open a Pull Request

### Code Guidelines
- ✅ ES6+ syntax
- ✅ JSDoc comments for functions
- ✅ Semantic HTML
- ✅ BEM methodology for CSS
- ✅ Mobile responsiveness required

---

## 📄 License

MIT License - use freely in personal and commercial projects.

---

## 👤 Author

**Mykola** — Frontend Developer & Designer

- 🐙 GitHub: [@frelancer-web-dev](https://github.com/frelancer-web-dev)
- 💼 Upwork: [Profile](https://www.upwork.com/freelancers/~01dec1110f4bac0e7d)
- 💬 Telegram: [@privatefanat_dep](https://t.me/privatefanat_dep)

## 🤝 AI Co-Author

Developed with support from **Jarvis AI Coder** — AI assistant for web development

---

## 📞 Support

If you have questions or suggestions:

- Create an [Issue](https://github.com/frelancer-web-dev/tasky/issues)
- Message me on [Telegram](https://t.me/privatefanat_dep)

---

⭐ **If this project was helpful, star it on GitHub!**
