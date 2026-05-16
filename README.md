# TaskOrbit

TaskOrbit is a production-grade team task management platform built with React, Vite, TailwindCSS, and Node.js.

## Project Structure

- `client/`: Frontend React application.
- `server/`: Backend Express.js API & Socket.io.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

Run the following command from the root directory to install all dependencies:

```bash
npm run install:all
```

### Development

To start both the frontend and backend in development mode:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (or `5174`) and the backend at `http://localhost:5000`.

## Features

- **Dual-Role Dashboard**: Custom views for Admins and Members.
- **Orbit View**: Interactive project urgency visualization.
- **Focus Mode**: Pomodoro-based productivity tool.
- **Real-time Messaging**: Socket.io-powered team chat.
- **Smart Kanban**: Task management with urgency indicators.
- **Analytics**: Performance tracking and project velocity.

## Keyboard Shortcuts

- `N`: New Task
- `F`: Search / Focus
- `M`: Messages
- `D`: Dashboard
- `?`: Shortcuts help
