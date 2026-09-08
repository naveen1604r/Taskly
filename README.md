# Taskly

> Enterprise Modern Daily Productivity and Task Management Web Application.

Taskly combines deep work sessions, habits, goal tracking, task management, recurring routines, reminders, daily activity, and inbox quick-capture into a unified, high-performance experience backed by Node.js, Express, and MySQL.

---

## Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, React Router v7, React Context API
- **Backend**: Node.js, Express.js (REST API architecture with Route → Controller → Service → Repository pattern)
- **Database**: MySQL 8.x with `mysql2/promise` connection pooling, foreign keys, and indexes
- **Security**: JWT Authentication, bcryptjs password hashing, Helmet security headers, rate limiting, request ID tracking, and parameterized SQL queries

---

## Development Setup

### 1. Prerequisites
- Node.js (v18+ recommended)
- MySQL Server (v8.0+ running locally or in Docker)
- Git

### 2. Repository Setup & Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd "To-do list"

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 3. Database Initialization

1. Ensure MySQL is running on your system (`localhost:3306`).
2. Create the database:
   ```sql
   CREATE DATABASE IF NOT EXISTS taskly CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Initialize the schema:
   ```bash
   mysql -u root -p taskly < server/database/schema.sql
   ```
   *(Note: The server also auto-runs all migrations in `server/database/migrations/` on startup if tables are absent).*

### 4. Environment Variables

#### Frontend Configuration (`.env`)
Create `.env` in the project root:
```env
VITE_API_URL=http://localhost:5000/api
```

#### Backend Configuration (`server/.env`)
Create `server/.env`:
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=taskly
DB_USER=root
DB_PASSWORD=your_mysql_password
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_development_secret_change_in_production
JWT_EXPIRES_IN=7d
```

### 5. Running in Development

```bash
# Terminal 1: Start Backend API (runs on http://localhost:5000)
cd server
npm run dev

# Terminal 2: Start Frontend Dev Server (runs on http://localhost:5173)
npm run dev
```

---

## Production Deployment

### 1. Production Environment Variables

#### Backend (`server/.env`)
```env
NODE_ENV=production
PORT=5000
DB_HOST=mysql.internal.yourhost.com
DB_PORT=3306
DB_NAME=taskly
DB_USER=taskly_app
DB_PASSWORD=strong_production_db_password
CLIENT_URL=https://app.yourdomain.com
JWT_SECRET=super_strong_cryptographic_random_secret_at_least_32_chars
JWT_EXPIRES_IN=7d
```
> **Validation**: The backend performs startup environment validation. In `NODE_ENV=production`, startup will safely abort if `JWT_SECRET`, `DB_HOST`, `DB_USER`, `DB_NAME`, or `CLIENT_URL` are missing or default.

#### Frontend Build Configuration (`.env.production`)
```env
VITE_API_URL=https://api.yourdomain.com/api
```

### 2. Database Migrations
Before deploying the API, run all incremental migrations against the production database:
```bash
mysql -h <prod-host> -u <prod-user> -p taskly < server/database/schema.sql
```

### 3. Backend Deployment (Node.js)
The backend is designed for process managers (e.g. PM2, Docker, AWS ECS, Render, Railway, DigitalOcean App Platform):

```bash
cd server
npm install --omit=dev
npm start
```
- Listens on `process.env.PORT`.
- Features built-in graceful shutdown on `SIGINT` and `SIGTERM` (drains connections and closes MySQL pool cleanly).
- Health probe: `GET /api/health`
- Readiness probe: `GET /api/ready`

### 4. Frontend Deployment (Static Hosting)
Deploy to static hosts (Vercel, Netlify, Cloudflare Pages, AWS S3 + CloudFront, Nginx):

```bash
npm run build
```
- Deployment output is located in `dist/`.
- Includes `public/_redirects` and `vercel.json` for SPA route rewriting (prevents 404s on deep route refreshes).

### 5. HTTPS & Security
- Production frontend and backend must strictly use HTTPS (SSL/TLS).
- Helmet enforces strict HTTP security headers (HSTS, X-Content-Type-Options, Frameguard).
- CORS restricts access strictly to the configured `CLIENT_URL`.
- Sensitive fields (passwords, JWT secrets, database connection details, stack traces) are sanitized and never logged or exposed in API errors.
- Rate limiting prevents denial-of-service and brute-force credential attacks.

---

## License & Author
Built with Taskly Productivity Architecture. Private and Proprietary.
