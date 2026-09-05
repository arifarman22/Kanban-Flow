# Kanban Flow

A full-stack Kanban board application with authentication, board sharing, and drag-and-drop task management.

## Live Demo

- **Frontend**: https://kanban-flow-theta.vercel.app
- **Backend**: https://kanban-flow-fo3g.onrender.com

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, @dnd-kit
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM (Neon compatible)
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **DevOps**: Docker + docker-compose

## Project Structure

```
kanban-app/
├── backend/          # Express API
│   ├── prisma/       # Schema & migrations
│   └── src/
│       ├── routes/   # auth, boards, columns, tasks
│       ├── middleware/
│       └── index.ts
├── frontend/         # Next.js app
│   ├── app/          # App router pages
│   ├── components/   # KanbanColumn, TaskCard, modals
│   └── lib/          # api client, types, AuthContext
├── docker-compose.yml
└── vercel.json
```

## Local Setup (Manual)

### Prerequisites
- Node.js 20+
- PostgreSQL 14+ (or a [Neon](https://neon.tech) serverless database)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev --name init
npm run dev
```

Backend runs on `http://localhost:4000`

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local if your backend is not on port 4000
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

### Environment Variables

**backend/.env**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/kanban?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=4000
FRONTEND_URL="http://localhost:3000"
```

> For Neon: replace `DATABASE_URL` with your Neon connection string (add `?sslmode=require` if needed).

**frontend/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Local Setup (Docker)

```bash
# From the project root
docker-compose up --build
```

This starts:
- PostgreSQL on port `5432`
- Backend API on port `4000` (runs migrations automatically)
- Frontend on port `3000`

Open `http://localhost:3000` in your browser.

## Deployment

The frontend and backend are deployed separately since Vercel only supports serverless functions and cannot host a persistent Express server.

### Backend → Render

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect GitHub → select **`Kanban-Flow`**
3. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Add environment variables:
   ```
   DATABASE_URL      = <your Neon connection string>
   JWT_SECRET        = <strong random string>
   PORT              = 4000
   FRONTEND_URL      = https://<your-vercel-app>.vercel.app
   ```

> **Free tier note**: Render spins down after 15 min of inactivity. To keep it alive, use [cron-job.org](https://cron-job.org) to ping `https://<your-render-url>/api/health` every 10 minutes for free.

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project → Import `Kanban-Flow`**
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL = https://<your-render-url>/api
   ```
4. Deploy

> After deploying both, update `FRONTEND_URL` on Render with your final Vercel URL so CORS is configured correctly.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/boards` | List accessible boards |
| POST | `/api/boards` | Create a board |
| GET | `/api/boards/:id` | Get board with columns & tasks |
| PUT | `/api/boards/:id` | Update board title |
| DELETE | `/api/boards/:id` | Delete board (owner only) |
| POST | `/api/boards/:id/members` | Share board by email |
| DELETE | `/api/boards/:id/members/:userId` | Remove member |
| POST | `/api/boards/:id/columns` | Create column |
| PUT | `/api/boards/:id/columns/:colId` | Rename column |
| DELETE | `/api/boards/:id/columns/:colId` | Delete column |
| POST | `/api/boards/:id/columns/:colId/tasks` | Create task |
| PUT | `/api/boards/:id/columns/:colId/tasks/:taskId` | Update task |
| DELETE | `/api/boards/:id/columns/:colId/tasks/:taskId` | Delete task |
| PATCH | `/api/boards/:id/columns/:colId/tasks/:taskId/move` | Move/reorder task |

### Move Task Payload
```json
{
  "targetColumnId": "column-id",
  "targetPosition": 0
}
```

## Features

- JWT-based authentication (register/login)
- Create, rename, delete boards
- Share boards with other users by email; remove members
- Access control — users can only access boards they own or are members of
- Create, edit, delete columns and tasks
- Drag-and-drop task reordering within and across columns (desktop + mobile)
- Stable position indexing with conflict-free reordering via DB transactions
- Fully responsive UI
