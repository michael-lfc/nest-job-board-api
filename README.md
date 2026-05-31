# Job Board API

A production-level RESTful Job Board API built with NestJS, Prisma, and PostgreSQL. Features JWT authentication, role-based access control, job filtering with pagination, CV file upload, email notifications, and auto-generated Swagger documentation.

---

## Tech Stack

- **Framework** — NestJS
- **Language** — TypeScript
- **Database** — PostgreSQL
- **ORM** — Prisma v6
- **Authentication** — JWT (JSON Web Tokens)
- **Password Hashing** — bcrypt
- **Validation** — class-validator, class-transformer
- **File Upload** — Multer
- **Email** — Nodemailer + @nestjs-modules/mailer
- **Documentation** — Swagger UI

---

## Features

- User registration and login with roles (CANDIDATE, COMPANY, ADMIN)
- JWT-based authentication
- Role-based access control
- Companies can post, update and delete jobs
- Candidates can apply for jobs with CV upload (PDF only)
- Email notification sent to candidate on successful application
- Job search and filtering by title, location and type
- Pagination on job listings
- Auto-generated Swagger API documentation
- Custom exception filter for consistent error responses

---

## Project Structure

```
job-board-api/
├── src/
│   ├── auth/
│   │   ├── dto/
│   │   │   ├── register.dto.ts
│   │   │   └── login.dto.ts
│   │   ├── guards/
│   │   │   ├── jwt.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── decorators/
│   │   │   ├── get-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   ├── jobs/
│   │   ├── dto/
│   │   │   ├── create-job.dto.ts
│   │   │   ├── update-job.dto.ts
│   │   │   └── filter-job.dto.ts
│   │   ├── jobs.controller.ts
│   │   ├── jobs.module.ts
│   │   └── jobs.service.ts
│   ├── applications/
│   │   ├── dto/
│   │   │   └── create-application.dto.ts
│   │   ├── applications.controller.ts
│   │   ├── applications.module.ts
│   │   └── applications.service.ts
│   ├── mail/
│   │   ├── mail.module.ts
│   │   └── mail.service.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── common/
│   │   └── filters/
│   │       └── http-exception.filter.ts
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   └── schema.prisma
├── uploads/
├── .env.example
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- PostgreSQL
- npm
- A Gmail account with App Password enabled

### Installation

1. Clone the repository

```bash
git clone https://github.com/michael-lfc/nest-job-board-api.git
cd nest-job-board-api
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env
```

Update `.env` with your values:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/job_board_db"
JWT_SECRET="yourjwtsecret"
MAIL_HOST="smtp.gmail.com"
MAIL_PORT=587
MAIL_USER="youremail@gmail.com"
MAIL_PASS="yourgoogleapppassword"
MAIL_FROM="youremail@gmail.com"
```

4. Run database migrations

```bash
npx prisma migrate dev
```

5. Start the development server

```bash
npm run start:dev
```

The API will be running at `http://localhost:3000`

---

## API Documentation

Once the server is running, visit:

```
http://localhost:3000/api/docs
```

Swagger UI provides interactive documentation for all endpoints. You can test protected routes by clicking the **Authorize** button and pasting your JWT token.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `MAIL_HOST` | SMTP host (smtp.gmail.com for Gmail) |
| `MAIL_PORT` | SMTP port (587 for Gmail) |
| `MAIL_USER` | Gmail address used to send emails |
| `MAIL_PASS` | Google App Password |
| `MAIL_FROM` | From address shown on emails |

### Generating a Google App Password

1. Go to myaccount.google.com
2. Click Security
3. Enable 2-Step Verification
4. Search App Passwords
5. Create one for Mail
6. Copy the 16 character password into MAIL_PASS

---

## API Endpoints

### Auth

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and get JWT token | No |

### Jobs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/jobs` | Get all jobs (filterable + paginated) | No |
| GET | `/api/jobs/:id` | Get a single job | No |
| POST | `/api/jobs` | Post a new job | Company only |
| PATCH | `/api/jobs/:id` | Update own job | Company only |
| DELETE | `/api/jobs/:id` | Delete own job | Company only |

### Applications

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/jobs/:jobId/apply` | Apply for a job with CV | Candidate only |
| GET | `/api/jobs/:jobId/applications` | Get applications for a job | Company only |
| GET | `/api/applications/me` | Get my applications | Candidate only |

---

## Job Filtering and Pagination

```
GET /api/jobs?title=developer&location=Lagos&type=FULL_TIME&page=1&limit=10
```

| Query Param | Type | Description |
|-------------|------|-------------|
| `title` | string | Filter by job title (case insensitive) |
| `location` | string | Filter by location (case insensitive) |
| `type` | enum | Filter by job type |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |

Paginated response includes a `meta` object:

```json
{
  "message": "Jobs retrieved successfully",
  "data": [...],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

## Request & Response Examples

### Register

**Request**
```json
POST /api/auth/register
{
  "email": "michael@gmail.com",
  "password": "password123",
  "name": "Michael",
  "role": "CANDIDATE"
}
```

**Response**
```json
{
  "message": "Registration successful",
  "data": {
    "id": 1,
    "email": "michael@gmail.com",
    "name": "Michael",
    "role": "CANDIDATE"
  }
}
```

---

### Post a Job

**Request**
```json
POST /api/jobs
Authorization: Bearer <company_token>
{
  "title": "Backend Developer",
  "description": "We are looking for a backend developer with NestJS experience",
  "location": "Lagos, Nigeria",
  "type": "FULL_TIME",
  "salary": "$1000 - $2000"
}
```

**Response**
```json
{
  "message": "Job created successfully",
  "data": {
    "id": 1,
    "title": "Backend Developer",
    "description": "We are looking for a backend developer with NestJS experience",
    "location": "Lagos, Nigeria",
    "type": "FULL_TIME",
    "salary": "$1000 - $2000",
    "companyId": 1,
    "createdAt": "2026-05-31T09:00:00.000Z",
    "updatedAt": "2026-05-31T09:00:00.000Z"
  }
}
```

---

### Apply for a Job

```
POST /api/jobs/1/apply
Authorization: Bearer <candidate_token>
Body: multipart/form-data
  cv: <PDF file>
```

**Response**
```json
{
  "message": "Application submitted successfully",
  "data": {
    "id": 1,
    "cvUrl": "uploads/cv-1234567890.pdf",
    "status": "PENDING",
    "candidateId": 1,
    "jobId": 1,
    "createdAt": "2026-05-31T09:00:00.000Z"
  }
}
```

---

## Authentication

This API uses JWT Bearer token authentication. After logging in, include the token in the `Authorization` header:

```
Authorization: Bearer <your_token>
```

Tokens expire after **7 days**.

---

## Roles

| Role | Permissions |
|------|------------|
| `CANDIDATE` | Apply for jobs, view own applications |
| `COMPANY` | Post jobs, update and delete own jobs, view applications for own jobs |
| `ADMIN` | All permissions |

---

## Job Types

```
FULL_TIME
PART_TIME
CONTRACT
INTERNSHIP
REMOTE
```

---

## Application Statuses

```
PENDING
REVIEWED
ACCEPTED
REJECTED
```

---

## Error Responses

All errors follow this consistent format:

```json
{
  "statusCode": 404,
  "message": "Job with id 999 not found",
  "timestamp": "2026-05-31T09:00:00.000Z",
  "path": "/api/jobs/999"
}
```

| Status Code | Meaning |
|-------------|---------|
| 400 | Bad Request — validation failed |
| 401 | Unauthorized — missing or invalid token |
| 403 | Forbidden — insufficient permissions |
| 404 | Not Found — resource does not exist |
| 409 | Conflict — already applied for this job |
| 500 | Internal Server Error |

---

## Database Schema

```prisma
enum Role {
  CANDIDATE
  COMPANY
  ADMIN
}

enum JobType {
  FULL_TIME
  PART_TIME
  CONTRACT
  INTERNSHIP
  REMOTE
}

enum ApplicationStatus {
  PENDING
  REVIEWED
  ACCEPTED
  REJECTED
}

model User {
  id           Int           @id @default(autoincrement())
  email        String        @unique
  password     String
  role         Role          @default(CANDIDATE)
  name         String
  jobs         Job[]
  applications Application[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model Job {
  id           Int           @id @default(autoincrement())
  title        String
  description  String
  location     String
  type         JobType
  salary       String?
  company      User          @relation(fields: [companyId], references: [id])
  companyId    Int
  applications Application[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model Application {
  id          Int               @id @default(autoincrement())
  cvUrl       String
  status      ApplicationStatus @default(PENDING)
  candidate   User              @relation(fields: [candidateId], references: [id])
  candidateId Int
  job         Job               @relation(fields: [jobId], references: [id])
  jobId       Int
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  @@unique([candidateId, jobId])
}
```

---

## Author

**Michael** — Backend Developer
