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

---

## 📡 API Reference

Base: `/api` · Health: `GET /api/health`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/signup`, `/auth/login` | Public | Register / login (seeker, employer) |
| `GET` / `PUT` | `/auth/me` | User | Get / update profile |
| `PUT` | `/auth/me/password` | User | Rotate password |
| `GET` | `/auth/files/resumes/:name` | User | Private résumé download |
| `GET` | `/jobs`, `/jobs/:id` | Public | Browse / job detail (demo fallback without DB) |
| `POST` | `/jobs` | Employer | Post a job (bound to managed company) |
| `PUT` / `DELETE` | `/jobs/:id` | Employer (owner) | Edit / delete job |
| `PATCH` | `/jobs/:id/status` | Employer (owner) | Publish / close / reopen |
| `GET` / `POST` | `/applications/mine`, `/applications` | Seeker | List / submit application (résumé upload) |
| `GET` | `/applications/received/overview` | Employer | Applicant pipeline grouped by job |
| `PATCH` | `/applications/:id/status` | Employer | Move applicant through pipeline |
| `GET` | `/companies`, `/companies/:slug` | Public | Browse / company profile |
| `GET` / `PUT` | `/companies/me`, `/companies/mine` | Employer | Manage own company profile(s) |
| `POST` | `/companies/me/logo` | Employer | Upload company logo |
| `GET` | `/notifications`, `/alerts` | User | Notifications, saved-search job alerts |

---

## 📁 Project Structure

```
StatiQ/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── pages/          # HomePage, JobsPage, DashboardPage, Company*Page, …
│   │   ├── components/     # Navbar, JobCard, ApplyModal, RichTextEditor, …
│   │   ├── context/        # AuthContext
│   │   ├── lib/            # api.js, jobs.js, companies.js, employer.js
│   │   └── data/mock.js    # Homepage fallback content
│   └── vite.config.js
├── server/                 # Express API
│   ├── routes/             # auth, jobs, applications, companies, notifications, alerts
│   ├── models/             # User, Company, Job, Application, JobAlert, Notification
│   ├── middleware/         # auth, upload, rateLimit, errorHandler
│   ├── config/db.js
│   ├── seed.js
│   └── server.js
└── README.md
```

**Key domain relationship:** `User (employer)` → `Company (brand)` → `Jobs` → `Applications`

---

## 🧑‍💻 Scripts

| Location | Command | Purpose |
|----------|---------|---------|
| `server` | `npm start` | Start API |
| `server` | `npm run dev` | Start API with nodemon |
| `server` | `npm run seed -- --confirm` | Seed demo data |
| `client` | `npm run dev` | Start Vite dev server |
| `client` | `npm run build` | Production build |
| `client` | `npm run lint` | Lint with oxlint |
| `client` | `npm run preview` | Preview production build |

---

## 🔒 Security Notes

- Résumés are **never** served statically — only via authenticated `GET /api/auth/files/resumes/:name`; legacy `/uploads/resume-*` paths return `403`.
- Request bodies/queries are sanitized against NoSQL-injection keys (`$...`, `...`) in an Express 4/5-safe way.
- Auth, application, and file routes sit behind rate limiters; browse endpoints use a lighter public limiter.
- The API stays up in **degraded mode** (browsing works, mutations return `503`) if MongoDB is unreachable.

---

## 🗺️ Roadmap

- [ ] Employer analytics (views, conversion funnel)
- [ ] Messaging between seekers and employers
- [ ] OAuth (Google/LinkedIn) login
- [ ] Full-text + vector job search
- [ ] S3/cloud storage for uploads
- [ ] CI + Docker Compose for one-command setup

---

## 🤝 Contributing

1. Fork the repo and create a feature branch (`git checkout -b feat/my-change`).
2. Keep client and server changes scoped; run `npm run lint` (client) before pushing.
3. Open a PR with a clear description and screenshots for UI changes.

---

## 📄 License

No license file yet — all rights reserved by default. Add a `LICENSE` (e.g. MIT) if you want this to be open source.
