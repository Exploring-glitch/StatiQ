# StatiQ — Startup Hiring Marketplace

A Wellfound-style hiring marketplace connecting **job seekers** with **startups**. Seekers browse jobs and company profiles, apply with résumés, save roles, and set job alerts. Employers post jobs, manage company brands, and run an applicant pipeline — all in a dark-themed, responsive UI.

**Stack:** React 19 · React Router 7 · Tailwind CSS 3 · Vite · Express 4 · MongoDB (Mongoose 8) · JWT

---

## ✨ Features

### For Job Seekers
- **Job board** (`/jobs`) with search, filters (position, location, remote, type), and saved-jobs matching
- **Job details** (`/jobs/:id`) with company links, apply flow, and save/unsave
- **Applications tracking** (`/my-applications`) — status pipeline per application
- **Saved jobs** (`/saved`), **job alerts** (`/alerts`), **notifications** (`/notifications`)
- **Company discovery** (`/companies`, `/companies/:slug`) — Overview, People, Culture & Benefits, Jobs tabs
- **Profile & settings** — photo, bio, résumé upload, password rotation

### For Employers
- **Dashboard** (`/dashboard`) — active jobs, application stats, recent applicants, quick actions
- **Post a job** (`/post-job`) — bound to a managed company (`companyId` + slug), draft/published states
- **Manage jobs** (`/jobs/manage`) — create, edit, publish/unpublish, close/reopen, delete (drafts stay private)
- **Applicants pipeline** (`/applicants`, `/jobs/:id/applicants`) — New → Shortlisted → Interview → Offer → Rejected
- **Company profile editor** (`/company/manage`) — logo upload, tagline, mission, WYSIWYG overview, founder/team, culture, benefits, socials
- **Personal vs. brand separation** — `User` (e.g. founder) manages a separate `Company` entity seekers see publicly

### Platform
- JWT auth with seeker/employer roles, protected routes, degraded-mode browsing when MongoDB is unreachable
- Security: Helmet, CORS allowlist, rate limiting, NoSQL-injection sanitization, `express-validator` input validation, private résumé serving (auth-only, no public static leaks)
- Seed script for demo companies, jobs, and users

---

## 🏗️ Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 19, React Router 7, Tailwind CSS 3.4, Vite 8 |
| Backend  | Node.js, Express 4, Mongoose 8, JWT, bcryptjs, Multer |
| Security | Helmet, CORS, express-rate-limit, express-validator |
| Database | MongoDB (Atlas or local) |
| Tooling  | oxlint, PostCSS, Autoprefixer, Nodemon |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (20 LTS recommended)
- MongoDB connection string (Atlas or local `mongodb://127.0.0.1:27017/statiq`)

### 1. Clone
```bash
git clone https://github.com/Exploring-glitch/StatiQ.git
cd StatiQ
```

### 2. Backend
```bash
cd server
cp .env.example .env   # then fill in MONGODB_URI + JWT_SECRET
npm install
npm run seed -- --confirm   # optional demo data
npm start                   # or: npm run dev (nodemon)
```
API → `http://localhost:5000/api/health`

### 3. Frontend
```bash
cd client
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```
App → `http://localhost:5173`

---

## ⚙️ Environment Variables

**`server/.env`**
| Variable      | Required | Description                                    |
|---------------|----------|------------------------------------------------|
| `MONGODB_URI` | Yes      | MongoDB connection string                      |
| `JWT_SECRET`  | Yes      | Secret for signing JWTs                          |
| `JWT_EXPIRES_IN` | No    | Token lifetime (default set in code)             |
| `CLIENT_URL`  | No       | Comma-separated CORS allowlist (default `http://localhost:5173`) |
| `PORT`        | No       | API port (default `5000`)                        |
| `NODE_ENV`    | No       | `development` / `production`                     |

**`client/.env`**
| Variable       | Required | Description              |
|----------------|----------|--------------------------|
| `VITE_API_URL` | Yes      | Backend base URL, e.g. `http://localhost:5000/api` |
