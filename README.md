# TrackNest — Productivity & Expense Dashboard

A professional full-stack application designed to unify task management and expense tracking. Built with a secure Django REST API and a dynamic React frontend, fully deployed and production-ready.

## 🌐 Live URLs (Production)

- **Frontend:** [https://tracknest-frontend-x6ln.onrender.com](https://tracknest-frontend-x6ln.onrender.com)
- **Backend API:** [https://tasksmanager-8pr8.onrender.com](https://tasksmanager-8pr8.onrender.com)

---

## 🚀 Key Features

* **Unified Dashboard**: Track both daily expenses and productivity tasks in one single interface.
* **Smart Analytics**: Real-time aggregation of total spending and task completion rates.
* **3-Tier Task Status**: Manage workflows with `Pending`, `In Progress`, and `Completed` statuses.
* **Secure Auth**: JWT-based authentication with secure token rotation and auto-refresh.
* **Data Isolation**: Multi-user support with strict row-level data security.
* **Scalable Architecture**: Powered by MySQL for reliable and structured data storage.

---

## 🛠️ Installations & Dependencies

### Backend (Django)
**Installation Command:**
```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers mysqlclient gunicorn whitenoise
```

**Packages Installed:**
- `Django`
- `djangorestframework`
- `djangorestframework-simplejwt`
- `django-cors-headers`
- `mysqlclient` (MySQL Driver)
- `gunicorn` (Production Server)
- `whitenoise` (Static File Serving)

### Frontend (React + Vite)
**Scaffolding Command:**
```bash
npx -y create-vite@latest frontend -- --template react
```

**Dependency Installation Command:**
```bash
npm install axios react-router-dom react-hot-toast lucide-react
```

**Packages Installed:**
- `react`, `react-dom`
- `axios`
- `react-router-dom`
- `react-hot-toast`
- `lucide-react`

---

## 📁 Project Structure

```text
TaskManager/
├── backend/                       # Django Backend
│   ├── manage.py                  # Django CLI entry point
│   ├── build.sh                   # Render deployment script
│   ├── requirements.txt           # Python dependencies
│   ├── taskmanager/               # Core Django config
│   │   ├── __init__.py
│   │   ├── asgi.py                # ASGI entry point
│   │   ├── settings.py            # Main application settings
│   │   ├── urls.py                # Global routing
│   │   └── wsgi.py                # WSGI entry point
│   └── tasks/                     # Primary app logic
│       ├── __init__.py
│       ├── admin.py               # Django admin configuration
│       ├── apps.py                # App configuration
│       ├── auth_urls.py           # Authentication routes
│       ├── exceptions.py          # Custom global exception handler
│       ├── models.py              # Database models (DailyEntry)
│       ├── serializers.py         # DRF serializers & validation
│       ├── tests.py               # Test suites
│       ├── urls.py                # App-specific routes
│       ├── views.py               # API endpoints
│       └── migrations/            # Database schema migrations
│           ├── __init__.py
│           ├── 0001_initial.py
│           ├── 0002_dailyentry_delete_task.py
│           ├── 0003_add_db_indexes.py
│           └── 0004_add_entry_type.py
│
├── frontend/                      # React Frontend (Vite)
│   ├── .gitignore                 # Frontend-specific Git ignores
│   ├── index.html                 # Main HTML template
│   ├── package.json               # Node.js dependencies
│   ├── package-lock.json          # Dependency lockfile
│   ├── tsconfig.json              # TypeScript config (if used)
│   ├── vite.config.js             # Vite build configuration
│   ├── .env.production            # Production API URL
│   ├── public/                    # Static public assets
│   │   ├── favicon.svg            
│   │   └── icons.svg
│   └── src/                       # Source code
│       ├── App.jsx                # React Router setup
│       ├── main.jsx               # React DOM entry point
│       ├── index.css              # Global styles
│       ├── components/            # Reusable UI components
│       │   ├── EntryCard.jsx      # Expense & Task card UI
│       │   ├── EntryModal.jsx     # Add/Edit entry form
│       │   ├── Navbar.jsx         # Top navigation bar
│       │   └── PrivateRoute.jsx   # Route protection wrapper
│       ├── context/               # Global state providers
│       │   └── AuthContext.jsx    # Authentication & Session state
│       ├── layouts/               # High-level layouts
│       │   └── AppLayout.jsx      # Main layout with sidebar
│       ├── pages/                 # Full application views
│       │   ├── Dashboard.jsx      # Stats and recent entries
│       │   ├── Entries.jsx        # Full entry list with filters
│       │   ├── Login.jsx          # Login page
│       │   ├── Profile.jsx        # User profile & stats
│       │   ├── Register.jsx       # Sign up page
│       │   └── Settings.jsx       # User settings/password change
│       ├── services/              # API utilities
│       │   └── api.js             # Axios interceptors & HTTP calls
│       └── utils/                 # Helper functions
│           └── constants.js       # Formatting, icons, & static data
│
├── .gitignore                     # Root Git exclusion rules
├── credentials.txt                # Database/Admin passwords (Ignored)
├── project_setup.txt              # Setup notes
└── README.md                      # This file
```

---

## 💻 Running Locally

### 1. Backend
```bash
cd backend
python manage.py runserver 8000
```

### 2. Frontend
```bash
cd frontend
npm run dev
```

---

## 🔌 Core API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login (JWT) |
| GET | `/api/dashboard` | Aggregated stats |
| GET | `/api/entries` | List entries (filtered) |
| POST | `/api/entries` | Create Task/Expense |
| DELETE | `/api/entries/{id}` | Delete entry |

---

## 🛡️ Security & Performance
- **Database Layer**: Queries optimized using Django `Annotate` and `Aggregate` for high performance.
- **Security**: Throttling enabled on Login/Register to prevent brute-force attacks.
- **Production**: Configured with WhiteNoise for fast static file delivery and secure HTTPS settings.