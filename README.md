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
