# 📚 MUC Library — University Resource Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)
![Stack](https://img.shields.io/badge/stack-React%20%7C%20Node.js%20%7C%20PostgreSQL-informational?style=flat-square)
![License](https://img.shields.io/badge/license-Academic%20Use-green?style=flat-square)
![Status](https://img.shields.io/badge/status-Production%20Ready-success?style=flat-square)

> A modern, full-stack web application that provides students with secure, centralized access to their university's academic book collection. Features real-time previews, smart analytics, and a powerful admin dashboard.

---

## 🌟 Project Overview

**MUC Library** is designed to digitize and streamline the discovery, reading, and management of academic resources. It replaces scattered file-sharing practices with a unified, authenticated, and beautifully designed platform. 

The application utilizes a robust modern tech stack to ensure high performance, security, and maintainability. 

---

## 🛠️ Technology Stack

Our platform leverages industry-standard technologies across the entire stack:

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
react hook form
zod                      _ validation 
```

- **React 18 & Vite**: Lightning-fast Single Page Application (SPA) with instant Hot Module Replacement (HMR).
- **TypeScript**: Ensuring end-to-end type safety and reducing runtime errors.
- **Tailwind CSS**: Utility-first CSS framework for highly responsive and modern styling.
- **Framer Motion**: Smooth page transitions and complex component animations.
- **React Router v6**: Advanced client-side routing with protected authenticated routes.
44fdcc58 (upgrading deploey , readme)

### Backend
- **Node.js & Express**: Robust and scalable RESTful API server.
- **TypeScript**: Typed controllers, middleware, and models.
- **Prisma ORM**: Type-safe database access layer simplifying database operations.
- **PostgreSQL**: Powerful, open-source relational database management system.
- **Brevo API**: Reliable transactional email delivery for secure OTP authentication.
- **JSON Web Tokens (JWT)**: Secure, stateless session management.
- **Multer**: Efficient handling of multipart/form-data for uploading covers, PDFs, and avatars.

---

## 🚀 Local Setup Instructions

Follow these steps to run the project locally on your machine for development.

### 1. Clone & Install
```bash
# Clone the repository (if applicable) or navigate to the project directory
cd "MUC Liberary"

# Install Backend Dependencies
cd server
npm install

# Install Frontend Dependencies
cd ../client
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `server/` directory:
```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/muclibrary"
JWT_SECRET="your_local_secret_key"
BREVO_API_KEY="your_brevo_api_key"
PORT=5000
```
Create a `.env` file in the `client/` directory:
```env
VITE_API_URL=http://localhost:5000
```

### 3. Database Initialization
```bash
cd server
# Generate Prisma Client and apply migrations
npx prisma generate
npx prisma migrate dev
```

### 4. Run Development Servers
Open two terminal windows:
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```
Your application will be available at `http://localhost:5173`.

---

## 🌐 Production Deployment

For detailed, step-by-step instructions on how to deploy this application to a production server (including database setup, environment configuration, PM2, and Nginx), please refer to our official deployment guide:

👉 **[View the Deployment Guide (DEPLOY.md)](./DEPLOY.md)**

---

## ✨ Key Features

- 🔐 **OTP Authentication:** Passwordless login via email with one-time 6-digit codes.
- 📖 **PDF Preview & Download:** Inline browser-native PDF viewer for instant reading.
- 🖼️ **Book Cover Gallery:** Rich visual book catalog with comprehensive metadata.
- ⭐ **Rating System:** Aggregated 1–5 star rating system for resources.
- 👤 **Profile Management:** Interactive profile updating with integrated picture cropping.
- 🛡️ **Admin Dashboard:** Comprehensive resource management (books, colleges, users).
- 🌙 **Dark Mode:** Elegant dark/light theme toggle.

---

## 👨‍💻 Developed By

Built with ❤️ by **Engineer Ayman Shaaban**.

For support, feedback, or inquiries, please contact:
- ✉️ Email: [aymankhattap483@gmail.com](mailto:aymankhattap483@gmail.com)
- 📞 Phone: +201156637548
