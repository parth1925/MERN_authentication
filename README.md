# MERN_authentication
Secure MERN authentication system with Node.js, Express, MongoDB and Redis.  Implements JWT authentication, refresh tokens, CSRF protection, rate limiting, bcrypt password hashing, Zod validation and two-step verification.

# 🔐 MERN Authentication System

A secure **MERN stack authentication system** built using **Node.js, Express, MongoDB, Redis and React**.
This project demonstrates production-level authentication and security practices including **JWT authentication, refresh tokens, CSRF protection, rate limiting, Redis caching, and Zod validation**.

---

# 🚀 Features

### 🔐 Authentication

* User Signup & Login
* Access Token & Refresh Token Authentication
* Two-Step Verification
* Secure password hashing using **bcrypt**

### 🛡 Security

* CSRF Token Protection
* Request body sanitization (prevents injection attacks)
* Rate limiting using **Redis**
* Secure authentication flow

### ⚡ Performance

* Redis caching for frequently accessed user data
* API rate limiting

### 📋 Validation

* Schema validation using **Zod**

### 🧠 Authorization

* Role based authorization
* Protected API routes using middleware

---

# 🧰 Tech Stack

### Frontend

* React.js
* Context API
* Axios Interceptors

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Caching

* Redis

### Security

* JWT Authentication
* Access Token & Refresh Token
* bcrypt password hashing
* CSRF protection
* Rate limiting

---

# 📁 Project Structure

```
project-root
│
├── backend
│   ├── config          # Database and Redis configuration
│   ├── controllers     # API business logic
│   ├── middlewares     # Authentication and security middlewares
│   ├── models          # MongoDB models
│   ├── routes          # API routes
│   │
│   ├── index.js        # Server entry point
│   ├── package.json
│   └── .env
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── assets          # Static assets
│   │   ├── context         # Global state using React Context
│   │   │   └── AppContext.jsx
│   │   ├── pages           # Application pages
│   │   ├── apiinterceptor.js # Axios interceptor for token handling
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── Loading.jsx
│   │
│   ├── package.json
│   └── eslint.config.js
│
└── README.md
```

---

# ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```
git clone https://github.com/your-username/project-name.git
```

---

### 2️⃣ Install Backend Dependencies

```
cd backend
npm install
```

---

### 3️⃣ Install Frontend Dependencies

```
cd frontend
npm install
```

---

### 4️⃣ Setup Environment Variables

Create `.env` file inside backend folder.

Example:

```
PORT=5000

MONGO_URI=your_mongodb_connection_string

ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret

REDIS_URL=your_redis_connection

FRONTEND_URL =http://localhost:3000

SMTP_PASSWORD =your_smtp_password
SMTP_USER = your_smtp_useid

```

---

### 5️⃣ Run Backend

```
npm run dev
```

---

### 6️⃣ Run Frontend

```
cd frontend
npm run dev
```

---

# 🔑 Authentication Flow

```
User Login
     ↓
Access Token Generated
     ↓
Stored in Client
     ↓
API Requests with Token
     ↓
Interceptor handles expired token
     ↓
Refresh Token generates new Access Token
```

---

# ⚡ Frontend Architecture

### Context API

Global application state is handled using **React Context API**.

Responsibilities:

* Store authenticated user data
* Manage login state
* Share global state across components

Example:

```
AppContext.jsx
```

---

### Axios Interceptor

Axios interceptor automatically:

* Attaches access token to API requests
* Handles token expiration
* Sends refresh token request

File:

```
apiinterceptor.js
```

---

# 🧪 API Testing

You can test APIs using:

* Postman
* Thunder Client

---

# 👨‍💻 Author

**Parth Kava**

Backend & MERN Developer

GitHub
https://github.com/parth1925
