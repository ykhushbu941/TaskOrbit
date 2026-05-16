# TaskOrbit 🌌

TaskOrbit is a premium, full-stack SaaS platform designed for elite team collaboration and task management. It features a stunning glassmorphic UI, real-time data synchronization, and an interactive "Orbit" visualization of team workload.

**🚀 Live Deployment:** [https://taskorbit2-production.up.railway.app](https://taskorbit2-production.up.railway.app)

## ✨ Features
- **Space-Themed Glassmorphic UI**: Ultra-premium aesthetic using Tailwind CSS and Framer Motion for micro-animations.
- **Role-Based Access Control (RBAC)**: Distinct permissions for Admins and Members.
- **Real-Time Synchronization**: Powered by Socket.io, enabling instant updates for tasks and project progress without refreshing.
- **Dynamic Kanban Boards**: Drag-and-drop or click-to-move task management with optimistic UI updates.
- **Team Orbit Visualization**: A custom interactive widget visualizing team capacity and workload.
- **Automated Progress Tracking**: Project completion dynamically calculates based on task statuses.
- **Live Activity Logs**: Persistent tracking of team activities and status updates.

## 🛠️ Tech Stack
- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Framer Motion, Zustand.
- **Backend**: Node.js, Express, TypeScript, Socket.io, JSON Web Tokens (JWT).
- **Database**: SQLite, Prisma ORM.

## 🚀 Local Development

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/ykhushbu941/TaskOrbit.git
   cd TaskOrbit
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```
   *(Or just `npm install` if using the updated package.json scripts).*

3. **Set up Environment Variables**
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_super_secret_key
   DATABASE_URL="file:./dev.db"
   ```

4. **Initialize the Database**
   ```bash
   cd server
   npx prisma db push
   npx prisma generate
   ```

5. **Start the Application**
   From the root directory, start both the client and server concurrently:
   ```bash
   npm run dev
   ```
   - Client runs on `http://localhost:5173`
   - Server runs on `http://localhost:5000`

## 📦 Deployment (Railway)
This project is configured as a Monorepo deployable directly to [Railway](https://railway.app/).
1. Connect your GitHub repository to Railway.
2. Railway will automatically detect the root `package.json` and build both the frontend and backend.
3. Ensure you map a **Volume** to `/app/server/prisma` so your SQLite database persists across deployments.
4. Set your Environment Variables in the Railway dashboard.
