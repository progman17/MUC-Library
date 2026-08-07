# 🚀 MUC Library — Deployment Guide

![Target](https://img.shields.io/badge/target-Production%20Server-red?style=flat-square)
![Node](https://img.shields.io/badge/requires-Node.js%2018%2B-339933?style=flat-square&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/requires-PostgreSQL%2014%2B-4169E1?style=flat-square&logo=postgresql)

> **For the Server Administrator.** Follow these steps carefully to ensure a seamless and secure deployment of the MUC Library application.

---

> [!IMPORTANT]
> ## 🌐 Transitioning to Institutional Domain on Brevo (Production)
>
> By default, the app is configured using a personal email. For **production**, you **must** configure an institutional or college domain on Brevo to ensure high deliverability and professional communication.
>
> **Step-by-Step Domain Verification:**
> 1. **Create/Login to Brevo:** Go to [Brevo](https://www.brevo.com/) and navigate to **Senders & IP > Domains**.
> 2. **Add Domain:** Click **Add a Domain** and enter your college domain (e.g., `muc.edu.eg`).
> 3. **DNS Configuration:** Brevo will provide specific TXT records. Access your DNS provider (e.g., Cloudflare, Route53, cPanel).
> 4. **Add TXT Records:**
>    - Add the **Brevo code** TXT record to verify ownership.
>    - Add the **DKIM** record to authenticate emails and prevent spam folder routing.
>    - Add the **SPF** record if you haven't already authorized Brevo.
> 5. **Verify:** Go back to Brevo and click **Verify & Authenticate**.
> 6. **Update Code:** Once verified, update the `sender` email in `server/src/utils/mailer.ts` to your new official email (e.g., `library@muc.edu.eg`).

---

## ⚠️ Prerequisites

Ensure the following are installed and running on the target server:

| Tool | Minimum Version | Command Check |
|---|---|---|
| **Node.js** | 18.x LTS | `node -v` |
| **npm** | 9.x | `npm -v` |
| **PostgreSQL**| 14.x | `psql --version` |
| **Git** (optional) | Any | `git --version` |

---

## 📂 1. Folder Structure

Transfer the project files to the server. Your directory structure should match the following precisely:

```text
MUC Library/
├── client/        ← React frontend source
├── server/        ← Express backend source
├── README.md      ← Project overview
└── DEPLOY.md      ← Deployment instructions
```

> [!WARNING]
> The `client/` and `server/` folders must remain siblings in the root directory for relative paths to resolve appropriately.

---

## 📦 2. Install Dependencies

Open a terminal and execute the following commands to install required packages.

### 2a. Backend Dependencies
```bash
cd server
npm install
```

### 2b. Frontend Dependencies
```bash
cd ../client
npm install
```

---

## ⚙️ 3. Environment Variables

Both the frontend and backend require a `.env` configuration file.

### 3a. Server `.env` (`server/.env`)

Create `server/.env` and populate it with the following:

```env
# ─── Database ────────────────────────────────────────
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/muclibrary"

# ─── Authentication ──────────────────────────────────
JWT_SECRET="replace_with_a_highly_secure_random_string_min_32_chars"

# ─── Brevo API (Mailing) ─────────────────────────────
BREVO_API_KEY="your_brevo_api_key_here"

# ─── Server ──────────────────────────────────────────
PORT=5000
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string. Update USERNAME, PASSWORD, and database name. |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens. Must be 32+ characters. |
| `BREVO_API_KEY`| Your Brevo API key for transactional emails. |
| `PORT` | The port for the Express backend. Defaults to `5000`. |

### 3b. Client `.env` (`client/.env`)

Create `client/.env` and add the backend URL:

```env
# URL of the backend API (no trailing slash)
VITE_API_URL=http://YOUR_SERVER_IP:5000
```

> [!TIP]
> Replace `YOUR_SERVER_IP` with the public IP address or domain name of your server. (e.g., `VITE_API_URL=https://api.muc-library.edu.eg`)

---

## 🗄️ 4. Database Initialization

Ensure PostgreSQL is actively running.

### 4a. Create the Database
```bash
psql -U postgres -c "CREATE DATABASE muclibrary;"
```

### 4b. Initialize Prisma & Run Migrations
```bash
cd server
npx prisma generate
npx prisma migrate deploy
```
> This automatically constructs all necessary tables in your database.

---

## 🗂️ 5. Uploads Directory Setup

The backend stores all uploaded assets within the `server/uploads/` directory. Create these directories to prevent runtime errors:

```bash
mkdir -p server/uploads/books-covers
mkdir -p server/uploads/books-pdfs
mkdir -p server/uploads/profiles
```

---

## 🏗️ 6. Build the Frontend

Compile the React frontend into static, production-ready files:

```bash
cd client
npm run build
```

This generates a `client/dist/` directory containing the optimized application.

---

## ▶️ 7. Start the Backend Server (PM2)

For production environments, using **PM2** is strongly recommended to ensure the backend automatically restarts on failure or server reboot.

```bash
cd server
npm install -g pm2
pm2 start npm --name "muc-library-api" -- run start
pm2 save
pm2 startup
```

---

## 🌐 8. Nginx Configuration (Reverse Proxy)

Configure Nginx to serve the frontend statically and proxy API requests to the backend.

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    # 1. Serve the React Frontend
    root /path/to/MUC Liberary/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 2. Proxy API Requests to Express
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 3. Serve Uploaded Files
    location /uploads/ {
        alias "/path/to/MUC Liberary/server/uploads/";
        access_log off;
        expires max;
    }
}
```

> [!NOTE]
> Ensure you replace `/path/to/MUC Liberary/` with the absolute path on your server and `YOUR_DOMAIN_OR_IP` with your actual domain.
