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
├── backend/                       # Django REST API
│   ├── build.sh                   # Render deployment script
│   ├── requirements.txt           # Python dependencies
│   ├── taskmanager/               # Project configuration
│   └── tasks/                     # Application logic & Models
├── frontend/                      # React Web App
│   ├── src/                       # Components, Context, Pages
│   ├── .env.production            # Production API URL
│   └── vite.config.js             # Vite configuration
└── .gitignore                     # Git exclusion rules
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