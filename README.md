# Projectly — Your Team’s Work, Organized.

Projectly is a production-ready, full-stack team project management and productivity platform designed to help teams plan projects, manage tasks via interactive Kanban boards, collaborate with team members, and track real-time progress from a unified workspace.

---

## Application Walkthrough & Screenshots

### 1. Authentication & 1-Click Demo Logins
Secure authentication portal featuring one-click demo credentials for rapid testing across Administrator, Frontend Lead, and Backend Lead roles.

![Authentication & Login](Screenshots/image1.png)

---

### 2. Executive Dashboard & Real-Time Analytics
Aggregated database metrics displaying active initiatives, task pipeline distribution (To Do, In Progress, Review, Done), workload priority allocation, and completion percentages.

![Executive Dashboard](Screenshots/image2.png)

---

### 3. Active Projects & Audit Activity Stream
Live project progress bars with milestone deadlines and a real-time audit log tracking team actions, task movements, and collaborator updates.

![Active Projects & Audit Stream](Screenshots/image3.png)

---

### 4. Project Management Directory
Comprehensive project catalog supporting instant text search, multi-condition status and priority filtering, and dual Grid/Table view modes.

![Project Management Directory](Screenshots/image4.png)

---

### 5. Interactive Kanban Board
4-column fluid drag-and-drop board (To Do, In Progress, Review, Done) with optimistic UI updates and instant database persistence.

![Interactive Kanban Board](Screenshots/image5.png)

---

### 6. Role-Based Personalized Workspace
Personalized workspace view demonstrating role-based access control, task assignments, and permission-aware project operations.

![Role-Based Personalized Workspace](Screenshots/image6.png)

---

## Features

- **User Authentication & RBAC**: JWT session authorization with bcrypt password hashing and tiered permissions (Owner, Admin, Member).
- **Project Management**: Full project lifecycle management (Create, Read, Update, Archive, Delete) with status tracking, priority flags, budget, and dates.
- **Task Management**: Comprehensive task CRUD with priorities (Low, Medium, High, Urgent), due dates, labels, assignees, and descriptions.
- **Interactive Kanban Board**: 4-column drag-and-drop board (To Do, In Progress, Review, Done) with optimistic UI caching and database persistence.
- **Project Progress Tracking**: Live calculated completion percentages based on task workflow statuses.
- **Dashboard Analytics**: Executive metrics showing project counts, task distributions, upcoming deadlines, and team workload.
- **Team Collaboration & Member Management**: Searchable member directory, project member invitations, and role delegations.
- **Task Commenting**: Real-time collaborative comment streams with author timestamps and delete privileges.
- **Activity & Audit Logging**: Automatic project-level event stream tracking status transitions, task creations, and member changes.
- **Search & Filtering**: Multi-condition filtering across projects and tasks by text query, priority, and lifecycle state.
- **Responsive Modern UI**: Built with React, Tailwind CSS, and Lucide icons, styled for clean desktop, tablet, and mobile workflows.

---

## Tech Stack

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **State & Data Fetching**: TanStack Query (React Query v5), Axios
- **Routing**: React Router DOM v6
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js (v18+ or v22+)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **Validation**: Zod schema validation
- **CORS**: cors middleware

---

## System Architecture

```text
[ React Client (Vite + TypeScript) ]
                │
         HTTP / REST API (Axios + TanStack Query)
                │
                ▼
[ Express Server (TypeScript + Middleware) ]
   ├── Authentication Guard (JWT Verification)
   ├── Request Validation (Zod Schemas)
   ├── Controllers (Business Logic)
   └── Services (Data Transformation & Audit Logging)
                │
         Mongoose ODM Queries
                │
                ▼
[ MongoDB Database (Atlas or Local Instance) ]
   ├── Users Collection
   ├── Projects Collection
   ├── Tasks Collection
   ├── Comments Collection
   └── Activities Collection
```

---

## Project Structure

```text
Projectly/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
├── Screenshots/
│   ├── image1.png
│   ├── image2.png
│   ├── image3.png
│   ├── image4.png
│   ├── image5.png
│   └── image6.png
├── client/
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx
│       ├── index.css
│       ├── main.tsx
│       ├── api/
│       │   ├── client.ts
│       │   └── index.ts
│       ├── components/
│       │   ├── common/
│       │   ├── kanban/
│       │   ├── layout/
│       │   └── modals/
│       ├── context/
│       │   └── AuthContext.tsx
│       ├── pages/
│       │   ├── DashboardPage.tsx
│       │   ├── LoginPage.tsx
│       │   ├── ProjectDetailPage.tsx
│       │   ├── ProjectsPage.tsx
│       │   └── RegisterPage.tsx
│       └── types/
│           └── index.ts
└── server/
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    └── src/
        ├── app.ts
        ├── server.ts
        ├── config/
        │   └── db.ts
        ├── controllers/
        │   ├── auth.controller.ts
        │   ├── comment.controller.ts
        │   ├── dashboard.controller.ts
        │   ├── project.controller.ts
        │   └── task.controller.ts
        ├── middleware/
        │   ├── auth.middleware.ts
        │   └── error.middleware.ts
        ├── models/
        │   ├── activity.model.ts
        │   ├── comment.model.ts
        │   ├── project.model.ts
        │   ├── task.model.ts
        │   └── user.model.ts
        ├── routes/
        │   ├── auth.routes.ts
        │   ├── comment.routes.ts
        │   ├── dashboard.routes.ts
        │   ├── index.ts
        │   ├── project.routes.ts
        │   └── task.routes.ts
        ├── scripts/
        │   └── seed.ts
        ├── services/
        │   └── activity.service.ts
        └── utils/
            ├── jwt.ts
            └── validators.ts
```

---

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB (local service or MongoDB Atlas URI)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Projectly
```

### 2. Install Dependencies
```bash
npm run install:all
```
*(Or install root, server, and client packages individually with `npm install`, `npm install --prefix server`, `npm install --prefix client`)*

### 3. Environment Variables
Copy `.env.example` to `server/.env`:
```bash
cp server/.env.example server/.env
```

Ensure the configuration matches your local environment:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/projectly_pm
JWT_SECRET=super_secret_jwt_projectly_platform_key_2026_production
JWT_EXPIRES_IN=7d
```

### 4. Database Seeding
Initialize sample accounts, projects, tasks, comments, and activities:
```bash
npm run seed
```

### 5. Start Development Servers
Run both backend and frontend concurrently:
```bash
npm run dev
```

- Client Application: http://localhost:5173
- Backend REST API: http://localhost:5000
- API Health Status: http://localhost:5000/api/health