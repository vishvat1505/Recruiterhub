# RecruitHub

A production-style, multi-role **Recruitment Management Platform** built on the MERN stack. Recruiters post jobs and move applicants through a full Applicant Tracking System (ATS); candidates build profiles, upload resumes, apply to roles, and track their progress in real time.

The platform features role-based access control, a complete ATS pipeline, real-time notifications over Socket.IO, resume management, and recruiter/candidate analytics dashboards.

---

## Features

### Roles & Auth
- Three roles: **candidate**, **recruiter**, **admin**
- JWT stored in an httpOnly cookie, bcrypt password hashing, rate-limited auth routes
- Role-based + ownership-based authorization on every protected route
- First registered account becomes admin; others self-register as candidate or recruiter

### Candidates
- Editable profile (name, phone, skills, experience, education, portfolio links) with a completion percentage
- **PDF resume upload** (Cloudinary, 5 MB limit, replace-and-destroy on re-upload)
- Browse open jobs with a search bar, apply (duplicate applications blocked)
- Track applications, view upcoming interviews, and **accept an offer** (which auto-declines all other active applications)

### Recruiters
- Post and manage jobs with an inline **open / closed / on-hold** status control
- Closed/on-hold jobs are hidden from candidates and reject new applications
- **Applicant Tracking System** — move applicants through stages: Applied → Shortlisted → Interview Scheduled → Interviewed → Offered → Rejected
- Recruiters extend offers; only a candidate's acceptance produces a **Hired**
- Schedule interviews (date/time, interviewer, notes, feedback)
- Dashboard with active jobs, total applicants, hiring funnel, and upcoming interviews
- Analytics: applications per month, conversion rate, hiring funnel, top-performing jobs

### Real-time
- **Socket.IO** notifications (cookie-authenticated) for new applications, stage changes, interview scheduling, and hiring decisions, with offline persistence and an in-app notification bell

---

## Tech Stack

**Backend:** Node.js, Express, MongoDB/Mongoose, JWT, bcrypt, Socket.IO, Cloudinary, Multer, express-validator, helmet
**Frontend:** React (Vite), React Router 6 (loaders/actions), React Query, styled-components, Recharts, react-toastify, socket.io-client

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local instance or MongoDB Atlas)
- A Cloudinary account (for resume/avatar uploads)

### 1. Install dependencies
```bash
npm run setup-project   # installs root + client dependencies
```

### 2. Environment variables
Create a `.env` file in the project root:

```env
NODE_ENV=development
PORT=5100

MONGO_URL=mongodb://localhost:27017/recruithub

JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=1d

CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
```

> `.env` is git-ignored — never commit your secrets.

### 3. Run the app
```bash
npm run dev      # backend (:5100) + frontend (:5173) together
```
Then open **http://localhost:5173**.

Run them separately if you prefer:
```bash
npm run server   # backend only
npm run client   # frontend only
```

---

## Scripts & Migrations

```bash
node migrations/seedTestUsers.js       # create/reset known test logins
node migrations/migrateToRecruitHub.js # migrate legacy Jobify data (user -> recruiter, backfill profiles)
node migrations/migrateJobStatus.js    # normalize legacy job statuses to "open"
```

### Test logins (after seeding)
| Role | Email | Password |
|------|-------|----------|
| Recruiter | `recruiter@test.com` | `secret123` |
| Candidate | `candidate@test.com` | `secret123` |

---

## Project Structure

```
.
├── controllers/      # auth, job, user, profile, application, interview, dashboard, analytics, notification
├── models/           # User, Job, CandidateProfile, Application, Interview, Notification
├── routes/           # one router per resource
├── middleware/        # auth, validation, multer, error handling
├── utils/             # socket.io, notifications, tokens, passwords, constants
├── migrations/        # data migration & seed scripts
├── server.js          # Express + Socket.IO entry point
└── client/            # React (Vite) frontend
    └── src/
        ├── pages/        # route components with loaders/actions
        ├── components/   # shared UI (navbar, dashboards, charts, notification bell)
        └── utils/        # customFetch (axios), socket client
```

---

## API Overview

| Area | Base route |
|------|------------|
| Auth | `/api/v1/auth` |
| Users | `/api/v1/users` |
| Candidate profiles | `/api/v1/profiles` |
| Jobs | `/api/v1/jobs` |
| Applications | `/api/v1/applications` |
| Interviews | `/api/v1/interviews` |
| Dashboards | `/api/v1/dashboard` |
| Analytics | `/api/v1/analytics` |
| Notifications | `/api/v1/notifications` |

Real-time events are delivered over Socket.IO on the same port.
