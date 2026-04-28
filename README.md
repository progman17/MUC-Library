# 📚 MUC Library — University Resource Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)
![Stack](https://img.shields.io/badge/stack-React%20%7C%20Node.js%20%7C%20PostgreSQL-informational?style=flat-square)
![License](https://img.shields.io/badge/license-Academic%20Use-green?style=flat-square)
![Status](https://img.shields.io/badge/status-Production%20Ready-success?style=flat-square)

> A modern, full-stack web application that gives MUC students secure, centralized access to their university's medical and engineering book collection — with real-time previews, smart analytics, and a powerful admin dashboard.

---

## 🌟 Overview

**MUC Library** is built for Misr University for Science and Technology (MUC) to digitize and streamline the way students discover, read, and manage academic resources. It replaces scattered file-sharing with a single, authenticated, beautifully designed platform.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 **OTP Authentication** | Passwordless login via university email (`@muc.edu.eg`) with a one-time 6-digit code |
| 📖 **PDF Preview & Download** | Inline browser-native PDF viewer for instant reading without leaving the app |
| 🖼️ **Book Cover Gallery** | Rich visual book catalog with cover images, ratings, and read counters |
| 🌐 **Paid / External Books** | "Go to Source" button linking students to purchase pages for paid books |
| ⭐ **Rating System** | Students can rate books 1–5 stars; ratings aggregate in real time |
| 👤 **Profile Management** | Upload a profile picture (with crop tool), update display name & phone number |
| 🛡️ **Admin Dashboard** | Add, edit, delete books; manage colleges & departments; upload covers and PDFs |
| 📊 **Analytics** | Track book read counts, visitor stats, and top-rated titles |
| 🌙 **Dark Mode** | Full dark/light theme toggle with smooth transitions across all pages |
| 📱 **Fully Responsive** | Optimized for mobile, tablet, and desktop |

---

## 🛠️ Technology Stack

### Frontend
```
React 18 + Vite          — Fast SPA with instant HMR
TypeScript               — End-to-end type safety
Tailwind CSS             — Utility-first responsive styling
Framer Motion            — Smooth page and component animations
React Router v6          — Client-side routing with protected routes
SweetAlert2              — Beautiful confirmation dialogs
Lucide React             — Consistent icon library
react-easy-crop          — Profile picture cropping
```

### Backend
```
Node.js + Express        — RESTful API server
TypeScript               — Typed routes, middleware, and models
Prisma ORM               — Type-safe database access layer
PostgreSQL               — Relational database
JSON Web Tokens (JWT)    — Stateless session authentication
Multer                   — File upload handling (covers, PDFs, avatars)
Nodemailer               — SMTP email delivery for OTP codes
```

---

## 📁 Project Structure

```
MUC Library/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── components/         # Navbar, Footer, ProtectedRoute, SEO...
│   │   ├── context/            # AuthContext (session, getMediaUrl helper)
│   │   ├── lib/                # api.ts, analytics.ts, types.ts
│   │   └── pages/              # Home, Books, BookDetails, Profile, AdminDashboard, Login
│   ├── public/                 # Static assets (logo, favicon)
│   ├── .env                    # VITE_API_URL
│   └── vite.config.ts          # Dev proxy for /api and /uploads
│
└── server/                     # Express backend
    ├── src/
    │   ├── config/             # Prisma client, Multer config
    │   ├── middlewares/        # JWT auth, isAdmin guard
    │   ├── routes/             # auth, books, users, colleges, analytics
    │   └── utils/              # Mailer utility
    ├── prisma/
    │   └── schema.prisma       # Database schema
    ├── uploads/                # Stored files (auto-created)
    │   ├── books-covers/
    │   ├── books-pdfs/
    │   └── profiles/
    └── .env                    # Server environment variables
```

---

## 🔒 Authentication Flow

```
1. User enters @muc.edu.eg email
2. Server generates a 6-digit OTP and sends it via SMTP
3. User submits OTP → Server validates and returns a JWT (7-day expiry)
4. Frontend stores token in localStorage and hydrates session from /auth/me
5. All protected routes require Bearer token in Authorization header
```

---

## 👥 User Roles

| Role | Permissions |
|---|---|
| **Student** | Browse books, preview PDFs, rate books, manage own profile |
| **Admin** | All student permissions + add/edit/delete books, manage colleges & departments |

---

## 📸 Screenshots

> The application features a clean, dark-mode-capable UI with glassmorphism effects, animated transitions, and a premium color palette built around MUC's signature red (`#8B0000`).

---

## 👨‍💻 Developed By

Built with ❤️ by the Engneer Ayman Shaaban

For support or queries contact [aymankhattap2021@gmail.com] or [+201156637548].
