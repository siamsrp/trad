# RUBICON LIBERTY 📈

A modern, institutional-grade high-frequency trading simulation engine and platform. Built with a robust Express/Socket.io backend and a premium React/Vite/Tailwind frontend.

---

## 📁 Project Structure

This is a monorepo containing both the frontend and the backend applications:

```text
├── backend/          # Express, Socket.io, & MongoDB Backend Server
│   ├── index.ts      # Server entry point & API routes
│   ├── models.ts     # Mongoose Schemas & Types
│   ├── package.json  # Backend dependencies & scripts
│   └── tsconfig.json # TypeScript configuration
│
├── trass/            # Premium React, Vite, & Tailwind CSS Frontend
│   ├── src/          # Source code (App.tsx, components, hooks, etc.)
│   ├── index.html    # Frontend entry point
│   ├── package.json  # Frontend dependencies & scripts
│   └── vite.config.ts# Vite configuration
│
└── .gitignore        # Unified Git ignore rules for the monorepo
```

---

## 🚀 Getting Started

### 📦 Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment variables. Create a `.env` file in the `backend/` folder:
   ```env
   PORT=3001
   MONGO_URI=your_mongodb_connection_string
   FIREBASE_PROJECT_ID=your_firebase_project_id
   # Add any other required Firebase keys or configs
   ```
4. Start the server in development mode:
   ```bash
   npm run dev
   ```

### 💻 Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd trass
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment variables. Create a `.env` file in the `trass/` folder:
   ```env
   VITE_API_URL=http://localhost:3001
   ```
4. Start the Vite dev server:
   ```bash
   npm run dev
   ```

---

## ⚡ Vercel Deployment Guide (Frontend)

To deploy the **RUBICON LIBERTY** frontend to **Vercel**, follow these simple steps:

1. **Import the repository** into Vercel from GitHub.
2. In the configuration settings:
   - **Framework Preset:** Vite
   - **Root Directory:** Set this to `trass`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. **Environment Variables:**
   - Add an environment variable named **`VITE_API_URL`** and set its value to your live, hosted backend URL (e.g., `https://your-backend-server.com`).
4. Click **Deploy**! 🎉

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, Motion, Recharts, Lightweight Charts, Socket.io-client.
- **Backend:** Node.js, Express, Socket.io, Mongoose (MongoDB), Firebase Admin.
