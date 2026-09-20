# StatiQ — Wellfound-style hiring marketplace (dark theme)

MERN + JavaScript + Tailwind CSS. v1 = Homepage UI clone.

## Run

Frontend:
```
cd client
npm install
npm run dev
```

Backend (placeholder for future features):
```
cd server
npm install
npm start
```

- Client: http://localhost:5173
- API: http://localhost:5000/api/health , /api/jobs

## Company profiles

Public pages at `/companies/:slug` with header (logo, name, short bio, employee
count) and four tabs: **Overview** (rich text — bold/italic/underline, sizes,
lists; spacing preserved), **People** (founder + team), **Culture & Benefits**
(remote policy, values, perks), **Jobs (n)** with filters for position,
location, accepted remote, type + clear.

- Employers: Dashboard → **Manage company profile** (`/company/manage`) to edit
  basics, logo upload, WYSIWYG overview, founder/team, culture. First job post
  auto-creates the profile.
- Seekers: `/companies` search, matching companies above `/jobs` results, and
  company links on job cards + `/jobs/:id`.
- API: `GET /api/companies`, `GET /api/companies/:slug`, `GET|PUT
  /api/companies/me`, `POST /api/companies/me/logo`. Seed with
  `npm run seed -- --confirm`.
