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
│   ├── taskmanager/               # Core Django settings & routing
│   │   ├── settings.py            # MySQL, JWT, logging, and CORS config
│   │   └── urls.py                # Global URL routing
│   ├── tasks/                     # Main application logic
│   │   ├── models.py              # DailyEntry model (Tasks & Expenses)
│   │   ├── views.py               # REST API endpoints & aggregations
│   │   ├── serializers.py         # Data validation & serialization
│   │   ├── exceptions.py          # Custom global exception handler
│   │   └── migrations/            # Database schema tracking
│   ├── manage.py                  # Django CLI entry point
│   └── requirements.txt           # Python dependencies (if exported)
│
├── frontend/                      # React Frontend (Vite)
│   ├── public/                    # Static assets (Favicon, etc.)
│   ├── src/                       # Main source code
│   │   ├── components/            # Reusable UI (EntryCard, EntryModal)
│   │   ├── context/               # Global state (AuthContext)
│   │   ├── layouts/               # Page wrappers (AppLayout with sidebar)
│   │   ├── pages/                 # Full views (Dashboard, Login, Entries)
│   │   ├── services/              # API utilities (Axios interceptors)
│   │   ├── utils/                 # Constants and formatter functions
│   │   ├── App.jsx                # React Router setup
│   │   ├── main.jsx               # React entry point
│   │   └── index.css              # Global styles, variables, and animations
│   ├── package.json               # Node.js dependencies
│   └── vite.config.js             # Vite build configuration
│
├── .gitignore                     # Git exclusion rules
├── credentials.txt                # Local DB & Admin credentials (Ignored by Git)
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