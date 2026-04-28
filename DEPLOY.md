# 🚀 MUC Library — Deployment Guide

![Target](https://img.shields.io/badge/target-Production%20Server-red?style=flat-square)
![Node](https://img.shields.io/badge/requires-Node.js%2018%2B-339933?style=flat-square&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/requires-PostgreSQL%2014%2B-4169E1?style=flat-square&logo=postgresql)

> **For the server administrator.** Follow these steps in order. Do not skip any step.

---

## ⚠️ Prerequisites

Before starting, ensure the following are installed on the server:

| Tool | Minimum Version | Check |
|---|---|---|
| Node.js | 18.x LTS | `node -v` |
| npm | 9.x | `npm -v` |
| PostgreSQL | 14.x | `psql --version` |
| Git (optional) | Any | `git --version` |

---

## 📂 Step 1 — Folder Structure

Copy the project to the server. The structure must look exactly like this:

```
MUC Library/
├── client/        ← React frontend source
├── server/        ← Express backend source
├── README.md
└── DEPLOY.md      ← This file
```

> **Important:** The `client/` and `server/` folders must remain siblings at the same level.

---

## 📦 Step 2 — Install Dependencies

Open a terminal and run the following commands **in order**:

### 2a. Install server dependencies
```bash
cd server
npm install
```

### 2b. Install client dependencies
```bash
cd ../client
npm install
```

> ⏱️ This may take 2–5 minutes on first run depending on internet speed.

---

## ⚙️ Step 3 — Environment Variables

Both `client/` and `server/` require a `.env` file. Create them as follows:

### 3a. Server `.env`  →  `server/.env`

```env
# ─── Database ────────────────────────────────────────
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/muclibrary"

# ─── Authentication ──────────────────────────────────
JWT_SECRET="replace_with_a_long_random_string_min_32_chars"

# ─── Email (SMTP) ────────────────────────────────────
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"

# ─── Server ──────────────────────────────────────────
PORT=5000
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Full PostgreSQL connection string. Replace `USERNAME`, `PASSWORD`, and DB name |
| `JWT_SECRET` | Secret key for signing JWTs. Use a random 32+ character string |
| `SMTP_HOST` | Your SMTP provider host (e.g., `smtp.gmail.com`) |
| `SMTP_PORT` | Usually `587` (TLS) or `465` (SSL) |
| `SMTP_USER` | The email address that sends OTP verification codes |
| `SMTP_PASS` | App password (for Gmail, generate one at myaccount.google.com → Security → App Passwords) |
| `PORT` | Port the backend listens on. Default: `5000` |

---

### 3b. Client `.env`  →  `client/.env`

```env
# URL of the backend API (no trailing slash)
VITE_API_URL=http://YOUR_SERVER_IP:5000
```

> Replace `YOUR_SERVER_IP` with the actual IP or domain of your server.  
> **Example:** `VITE_API_URL=http://192.168.1.100:5000`

---

## 🗄️ Step 4 — Database Setup

Make sure PostgreSQL is running and a database named `muclibrary` exists.

### 4a. Create the database (if it doesn't exist)
```bash
psql -U postgres -c "CREATE DATABASE muclibrary;"
```

### 4b. Generate the Prisma client
```bash
cd server
npx prisma generate
```

### 4c. Run database migrations
```bash
npx prisma migrate deploy
```

> ✅ This will create all required tables in the database automatically.

### 4d. (Optional) Verify the database in Prisma Studio
```bash
npx prisma studio
```
Opens a browser UI at `http://localhost:5555` to inspect the database.

---

## 🗂️ Step 5 — Uploads Folder

The server stores all uploaded files (book covers, PDFs, profile pictures) in a structured `uploads/` directory inside the `server/` folder.

### Required structure
```
server/
└── uploads/
    ├── books-covers/    ← Book cover images
    ├── books-pdfs/      ← Book PDF files
    └── profiles/        ← User profile pictures
```

### Create the folders manually if they don't exist
```bash
mkdir -p server/uploads/books-covers
mkdir -p server/uploads/books-pdfs
mkdir -p server/uploads/profiles
```

> **If migrating from an existing installation:** Copy the entire `uploads/` folder from the old server to `server/uploads/` on the new machine. All file references in the database use relative filenames, so paths will resolve correctly as long as the folder structure is preserved.

---

## 🏗️ Step 6 — Build the Frontend

```bash
cd client
npm run build
```

This creates a production-optimized `client/dist/` folder with static HTML/JS/CSS files.

> To serve the frontend, either:
> - Use **Nginx** to serve `client/dist/` as a static site, or
> - Use a static file server like `serve`: `npx serve client/dist -p 3000`

---

## ▶️ Step 7 — Start the Backend Server

```bash
cd server
npm run start
```

> For production, it is strongly recommended to use **PM2** to keep the server alive:
> ```bash
> npm install -g pm2
> pm2 start npm --name "muc-library-api" -- run start
> pm2 save
> pm2 startup
> ```

---

## 🌐 Step 8 — Nginx Configuration (Recommended)

If using Nginx as a reverse proxy, here is a minimal working configuration:

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    # Serve the React frontend
    root /path/to/MUC Liberary/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Express backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve uploaded files directly
    location /uploads/ {
        alias /path/to/MUC Liberary/server/uploads/;
    }
}
```

---

## ✅ Deployment Checklist

```
[ ] Node.js 18+ installed
[ ] PostgreSQL 14+ running
[ ] server/.env created with all required keys
[ ] client/.env created with correct VITE_API_URL
[ ] npm install completed in both client/ and server/
[ ] npx prisma generate completed
[ ] npx prisma migrate deploy completed
[ ] uploads/ subfolders created (books-covers, books-pdfs, profiles)
[ ] client/ built with npm run build
[ ] Backend server running (npm run start or PM2)
[ ] Frontend being served (Nginx or serve)
[ ] Firewall allows ports 80 (HTTP) and 5000 (API) or 443 (HTTPS)
```

---

## 🆘 Troubleshooting

| Problem | Likely Cause | Fix |
|---|---|---|
| `Cannot connect to database` | Wrong `DATABASE_URL` | Double-check username, password, host, and DB name |
| `OTP email not sending` | Wrong SMTP credentials | Use a Gmail App Password, not your regular password |
| `Images not loading` | Missing `uploads/` folder | Create the folder structure in Step 5 |
| `401 Unauthorized` on API | Missing or expired JWT | Clear localStorage and log in again |
| `CORS error` | Wrong `VITE_API_URL` | Ensure it matches the server IP and port exactly |
| Prisma type errors | Client not regenerated | Run `npx prisma generate` again |

---

*MUC Library — Deployment Guide v1.0*
