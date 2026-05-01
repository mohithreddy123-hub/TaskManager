# TrackNest — Productivity & Expense Dashboard

A full-stack, responsive, multi-user application designed to track both daily productivity tasks and expenses. Built with a modern tech stack featuring a secure Django REST API backend and a dynamic React frontend styled with vanilla CSS and Lucide icons.

## 🚀 Features

* **Dual Tracking System**: Seamlessly switch between creating Expenses (amount, category) and Tasks (due dates, progress statuses) in the same unified dashboard.
* **3-Tier Status System**: Track tasks as `Pending`, `In Progress`, or `Completed` with dynamic visual badges and toggle buttons.
* **Dashboard Stats**: Real-time aggregated statistics for total expenses, monthly spending, and task completion metrics.
* **Filter & Search**: Quickly find entries using a live search bar, date filters (today, week, month), entry type filters, category filters, and status filters.
* **Secure Authentication**: JWT-based authentication (with automatic token refreshing) and securely hashed passwords. Users only see and manage their own isolated data.
* **Brute-Force Protection**: Login endpoints are strictly rate-limited (10 attempts/min) to prevent brute force attacks.
* **Modern UI/UX**: Clean dark mode aesthetics, glassmorphism design, custom tooltips, and smooth micro-animations.

## 🛠️ Tech Stack

### Backend
* **Python** & **Django** (Core Web Framework)
* **Django REST Framework (DRF)** (API Layer)
* **SimpleJWT** (JSON Web Tokens)
* **MySQL** (Production Database)
* **Django CORS Headers** (Cross-Origin Resource Sharing)

### Frontend
* **React** & **Vite** (Frontend Framework)
* **Vanilla CSS** (Styling & Layout)
* **Axios** (API Requests & Interceptors)
* **React Router Dom** (Navigation)
* **React Hot Toast** (Notifications)
* **Lucide React** (SVG Icons)

## 📁 Project Structure

```text
TaskManager/
├── backend/                       # Django Backend
│   ├── manage.py                  # Django CLI entry point
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
│   ├── public/                    # Static public assets
│   │   ├── favicon.svg            
│   │   └── icons.svg
│   └── src/                       # Source code
│       ├── App.jsx                # React Router setup
│       ├── main.jsx               # React DOM entry point
│       ├── index.css              # Global styles & tailwind
│       ├── style.css              # Legacy/additional styles
│       ├── counter.ts             # Default Vite script (unused)
│       ├── main.ts                # Default Vite script (unused)
│       ├── assets/                # Internal static assets
│       │   ├── hero.png
│       │   ├── typescript.svg
│       │   └── vite.svg
│       ├── components/            # Reusable UI components
│       │   ├── EntryCard.jsx      # Expense & Task card UI
│       │   ├── EntryModal.jsx     # Add/Edit entry form
│       │   ├── Navbar.jsx         # Top navigation bar
│       │   ├── PrivateRoute.jsx   # Route protection wrapper
│       │   ├── TaskCard.jsx       # Legacy task card
│       │   └── TaskModal.jsx      # Legacy task modal
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

## 💻 How to Run Locally

You will need two separate terminal windows to run both servers simultaneously. Before starting, ensure your MySQL server is running and the database matches your credentials.

### 1. Start the Backend Server
```bash
cd backend
python manage.py runserver 8000
```
> The Django API will be available at `http://127.0.0.1:8000`

### 2. Start the Frontend Server
Open a new terminal window:
```bash
cd frontend
npm run dev
```
> The React Web App will be available at `http://localhost:5173`

## 🔌 API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/register` | ❌ No | Create a new user account |
| POST | `/api/auth/login` | ❌ No | Login and receive JWT tokens (Rate-Limited) |
| POST | `/api/auth/token/refresh` | ❌ No | Refresh an expired JWT access token |
| GET | `/api/auth/profile` | ✅ Yes | Get logged-in user profile |
| PUT | `/api/auth/profile` | ✅ Yes | Update profile (e.g., name) |
| POST | `/api/auth/change-password`| ✅ Yes | Securely change account password |
| GET | `/api/dashboard` | ✅ Yes | Get aggregated stats (expenses, tasks, categories) |
| GET | `/api/entries` | ✅ Yes | Get all entries (supports filtering/sorting) |
| POST | `/api/entries` | ✅ Yes | Create a new task or expense entry |
| PUT/PATCH | `/api/entries/{id}` | ✅ Yes | Edit/Update an entry |
| DELETE | `/api/entries/{id}` | ✅ Yes | Delete an entry |

## 🛡️ Security Details
* **Passwords** are securely hashed using Django's PBKDF2 algorithm.
* **Tokens**: Short-lived `access_token` and long-lived `refresh_token` are used for secure session management. Axios interceptors automatically refresh tokens in the background.
* **Data Isolation**: All API endpoints are strictly filtered by `request.user` to prevent cross-account data leakage.
* **Rate Limiting**: `LoginRateThrottle` is active on authentication endpoints.
* **Robust Validation**: All backend APIs dynamically validate payloads to ensure data integrity (e.g., expenses cannot have negative amounts, tasks do not require amounts).