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
  basics, logo upload, WYSIWYG overview, founder/team, culture. The first job
  post auto-creates the profile.
- Seekers: `/companies` search, matching companies above `/jobs` results, and
  company links on job cards + `/jobs/:id`.
- API: `GET /api/companies`, `GET /api/companies/:slug`, `GET|PUT
  /api/companies/me`, `POST /api/companies/me/logo`. Seed with
  `npm run seed -- --confirm`.

## Employer panel

Person vs brand: the **employer** (`User`, e.g. Sreeja Dey, Founder) manages a
separate **Company** entity (e.g. Lupira) that seekers see publicly.
Relationship: User → Company → Jobs → Applications.

- **Dashboard** (`/dashboard`) — greeting, company header, active jobs,
  total/new applications, recent applications, quick post-a-job + company access.
- **Company Profile** (`/company/manage`) — the public brand page draft:
  logo, name, tagline, bio, mission, overview, size, website, industry,
  location, founder/team, culture, benefits, social links. View-first cards with
  Edit → editable fields; global Edit unlocks all.
- **Jobs** (`/jobs/manage`) — all managed roles (Active/Draft/Closed) with
  create, edit (`/post-job?edit=<id>`), view, publish/unpublish, close/reopen,
  delete. Drafts never appear on the public board.
- **Post a job** (`/post-job`) — auto-selects the single managed company (a
  selector appears with several); the role is bound to the company (`companyId`
  + slug) so it appears under the brand, never the person.
- **Applicants** (`/applicants`) — pipeline grouped by job (New, Shortlisted,
  Interview, Offer, Rejected) via `GET /api/applications/received/overview`;
  per-role review stays at `/jobs/:id/applicants`.
- **My profile** (`/profile`) — the employer's personal profile only (photo,
  name, role, bio); company data is linked, never edited there.
- **Settings** (`/settings`) — account facts, company shortcut, notifications
  inbox, password rotation (`PUT /api/auth/me/password`), logout.
- Multi-company ready: `GET /api/companies/mine` lists managed companies for
  selectors, and job ownership checks accept any managed `companyId`.
