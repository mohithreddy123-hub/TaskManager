# TaskFlow — Personal Task Manager

A full-stack, responsive, multi-user task management application. Built with a modern tech stack featuring a secure Django REST API backend and a dynamic React frontend styled with Tailwind CSS.

## 🚀 Features

* **Secure Authentication**: JWT-based authentication with securely hashed passwords. Users only see and manage their own data.
* **Modern UI/UX**: Clean dark mode aesthetics, glassmorphism design, and smooth micro-animations.
* **Task Management**: Full CRUD capabilities—Create, view, update, delete, and toggle tasks (Completed / Pending).
* **Dashboard Stats**: Real-time stats cards for total, completed, and pending tasks.
* **Filter & Search**: Quickly find tasks using the live search bar or status filters.
* **User Profiles**: View and manage your profile details inline.

## 🛠️ Tech Stack

### Backend
* **Python** & **Django** (Core Web Framework)
* **Django REST Framework (DRF)** (API Layer)
* **SimpleJWT** (JSON Web Tokens)
* **SQLite** (Database)
* **Django CORS Headers** (Cross-Origin Resource Sharing)

### Frontend
* **React** & **Vite** (Frontend Framework)
* **Tailwind CSS v4** (Styling & Layout)
* **Axios** (API Requests)
* **React Router Dom** (Navigation)
* **React Hot Toast** (Notifications)
* **Lucide React** (SVG Icons)

## 📁 Project Structure

```text
TaskManager/
├── backend/                     # Django project & REST APIs
├── frontend/                    # React (Vite) SPA project
├── .gitignore                   # Git exclusion rules
├── project_setup.txt            # Local setup notes
└── README.md                    # This file
```

## 💻 How to Run Locally

You will need two separate terminal windows to run both servers simultaneously.

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
| POST | `/api/auth/login` | ❌ No | Login and receive JWT tokens |
| GET | `/api/auth/profile` | ✅ Yes | Get logged-in user profile |
| PUT | `/api/auth/profile` | ✅ Yes | Update profile (e.g., name) |
| GET | `/api/tasks` | ✅ Yes | Get all tasks for the logged-in user |
| POST | `/api/tasks` | ✅ Yes | Create a new task |
| PUT | `/api/tasks/{id}` | ✅ Yes | Edit/Update a task |
| DELETE | `/api/tasks/{id}` | ✅ Yes | Delete a task |

## 🛡️ Security Details
* **Passwords** are securely hashed by Django's auth system before saving.
* **Tokens**: `access_token` and `refresh_token` are used for secure session management. Axios interceptors handle injecting the token into API calls and auto-logout on a `401 Unauthorized` response.
* **Data Isolation**: All task API endpoints are strictly filtered by `request.user` to prevent cross-account data access.