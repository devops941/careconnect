# 🏥 CareConnect - Smart Hospital OPD Queue & Appointment Management Platform

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4-black.svg?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.3-blue.svg?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-blue.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-green.svg?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Security](https://img.shields.io/badge/Security-Argon2id%20%2B%20HMAC-red.svg?style=flat&logo=auth0)](https://github.com/P-H-C/phc-winner-argon2)

CareConnect is a comprehensive, production-grade Hospital Outpatient Department (OPD) Queue and Appointment Coordination System. It streamlines the patient lifecycle from digital booking and walk-in front-desk triage, to doctor consultation queues, digital prescription generation, and automated role-based hospital administration.

---

## 📑 Table of Contents
1. [System Architecture & Technology Stack](#1-system-architecture--technology-stack)
2. [Authentication & Login Data Flow](#2-authentication--login-data-flow)
3. [Master Login Credentials Table](#3-master-login-credentials-table)
4. [Role-Based Access Control (RBAC) Matrix](#4-role-based-access-control-rbac-matrix)
5. [Core Modules & Operational Features](#5-core-modules--operational-features)
6. [Database Schema Overview](#6-database-schema-overview)
7. [Installation & Setup Guide](#7-installation--setup-guide)

---

## 1. System Architecture & Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend Framework** | **Next.js 16 (App Router) + React 19** | Server & Client Components, Responsive Glassmorphism UI |
| **Language** | **TypeScript 7** | End-to-end strict type-safety across schema, API, and UI |
| **Styling & Icons** | **Tailwind CSS + Lucide React** | Modern clinical design system with fluid animations |
| **Database** | **MongoDB Atlas + Mongoose 9** | Scalable document store with relational index references |
| **Password Security** | **Argon2id (`@node-rs/argon2`)** | Memory-hard, GPU-resistant modern password hashing |
| **Session & Token** | **HMAC-SHA256 Signed Cookies** | HTTP-Only, Secure, SameSite protected `careconnect_session` |
| **Form Management** | **React Hook Form + Zod** | Client-side validation synchronized with backend schemas |
| **Notifications** | **Sonner** | Interactive toast notifications with role-aware status alerts |

---

## 2. Authentication & Login Data Flow

CareConnect implements a multi-tier identity resolution pipeline that automatically differentiates between **Super Admins**, **Hospital Staff (Doctors, Admins, Receptionists)**, and **Patients**, accepting either **Email Addresses** or **Employee IDs**.

### 2.1 Complete Authentication Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as Patient / Doctor / Admin
    participant UI as LoginForm (Client UI)
    participant API as /api/auth/login (Next.js Route)
    participant RL as Rate Limiter (Memory Store)
    participant IR as IdentityResolver (Backend Service)
    participant DB as MongoDB Collections
    participant PS as PasswordService (Argon2id)
    participant SS as SessionService (HMAC Token)
    participant Guard as Middleware & Route Guard

    User->>UI: Enters Email / Employee ID & Password
    UI->>UI: Validates fields with Zod (loginSchema)
    UI->>API: POST /api/auth/login { email, password, rememberMe }
    
    API->>RL: Check IP Rate Limit (Max 10 req / 60 sec)
    alt Rate Limit Exceeded
        RL-->>API: 429 Too Many Requests
        API-->>UI: Show Rate Limit Error Toast
    end

    API->>IR: findByNormalizedEmail(email) OR findByEmployeeId(id)
    
    IR->>DB: 1. Check super_admins collection
    alt Is Super Admin
        DB-->>IR: Return SuperAdmin document
    else Not Super Admin
        IR->>DB: 2. Check employees collection (Doctors, Admins, Receptionists)
        alt Is Employee
            DB-->>IR: Return Employee document (Role + Dept + EmployeeId)
        else Not Employee
            IR->>DB: 3. Check patients & users collections
            DB-->>IR: Return Patient document (or null)
        end
    end

    alt Identity Not Found
        IR-->>API: Throw AccountNotFoundError (404)
        API-->>UI: 404 ACCOUNT_NOT_FOUND
        UI->>UI: Display "User Not Found" banner
        UI->>User: Auto-redirect to /register?email=...
    end

    API->>PS: verifyPassword(plainPassword, passwordHash)
    alt Password Mismatch
        PS-->>API: False
        API->>DB: Write LOGIN_FAILED to audit_logs
        API-->>UI: 401 AuthenticationError ("Invalid email or password")
    end

    API->>DB: Update lastLogin date & write LOGIN_SUCCESS audit log
    API->>SS: signSessionToken({ sub, email, name, role, identityType })
    SS-->>API: Signed Cryptographic JWT / HMAC Token

    API->>API: Attach HTTP-Only Cookie: "careconnect_session"
    API-->>UI: 200 OK { success: true, user: { role, name, email } }

    UI->>Guard: Navigate to Dashboard based on Role
    alt Role === PATIENT
        Guard->>User: Display /patient/dashboard
    else Role in [DOCTOR, RECEPTIONIST, ADMIN, SUPER_ADMIN]
        Guard->>User: Display /staff/dashboard
    end
```

### 2.2 Key Security Features of the Login Engine
1. **Identifier Auto-Detection**:
   - If the user enters an identifier without an `@` symbol (e.g., `DOC-2026-001` or `EMP-ADM-01`), the backend automatically treats it as an **Employee ID**.
   - If the user enters an email address, it normalizes casing and whitespace before matching.
2. **Argon2id Cryptographic Standard**:
   - Memory Cost: `65536 KB` (64 MB)
   - Time Cost: `3 iterations`
   - Parallelism: `4 threads`
   - Immune to GPU-accelerated brute-force attacks.
3. **HTTP-Only Session Management**:
   - The session token is stored strictly in an `httpOnly: true`, `sameSite: "lax"`, and `path: "/"` cookie named `careconnect_session`. JavaScript on the client cannot read the raw token, preventing XSS-based session hijacking.
4. **Smart "User Not Found" Redirection**:
   - If an unregistered email attempts to sign in, the backend responds with `ACCOUNT_NOT_FOUND` (404). The frontend detects this and smoothly redirects the user to `/register?email=...` with the email pre-populated for frictionless onboarding.
5. **Bidirectional Route Protection**:
   - A logged-in **Patient** attempting to access `/staff/dashboard` is intercepted and rerouted to `/patient/dashboard`.
   - A logged-in **Doctor or Staff member** attempting to access `/patient/dashboard` is rerouted to `/staff/dashboard`.

---

## 3. Master Login Credentials Table

All credentials below are active in MongoDB and ready for immediate testing.
> 🔑 **Unified Password**: For all Doctors, Nurses, Receptionists, and Patients, the password is **`Password123!`**.
> 🛡️ **Super Admin Password**: **`Admin@123`**.
> 💡 **Login Identifier**: Staff can log in using either their **Email** or their **Employee ID** (e.g. `gokul@gmail.com` or `DOC-101`).

---

### 🛡️ 3.1 Super Administrator Account
| Name | Role | Email | Password | Access Scope | Target Dashboard |
|---|---|---|---|---|---|
| System Administrator | `SUPER_ADMIN` | `admin@gmail.com` | `Admin@123` | Entire Hospital Network | `/staff/dashboard` |

---

### 🏥 3.2 Hospital 1: CareConnect City Hospital (Chennai - `CC-CITY`)

#### 👨‍⚕️ Doctors (3 Doctors)
| Doctor Name | Specialization / Dept | Email | Doctor ID | Password | OPD Room | Status |
|---|---|---|---|---|---|---|
| **Dr. Gokul R** | General Medicine | `gokul@gmail.com` | `DOC-101` | `Password123!` | Room 101 | Active |
| **Dr. Priya Annamalai** | Cardiology | `priya@gmail.com` | `DOC-102` | `Password123!` | Room 102 | Active |
| **Dr. Rajesh Kumar** | Pediatrics & Child Health | `rajesh@gmail.com` | `DOC-103` | `Password123!` | Room 103 | Active |

#### 👩‍⚕️ Nurses (2 Nurses)
| Nurse Name | Role | Department / Station | Email | Staff ID | Password | Target Dashboard |
|---|---|---|---|---|---|---|
| **Sister Anitha V, RN** | `NURSE` | OPD Triage / Vitals Station | `anitha@gmail.com` | `NUR-101` | `Password123!` | `/staff/dashboard` |
| **Sister Deepa M, RN** | `NURSE` | Emergency & Vitals Intake | `deepa@gmail.com` | `NUR-102` | `Password123!` | `/staff/dashboard` |

#### 💼 Receptionist (1 Receptionist)
| Name | Role | Department | Email | Staff ID | Password | Target Dashboard |
|---|---|---|---|---|---|---|
| **Ramesh Kannan** | `RECEPTIONIST` | Central Registration & Front Desk | `ramesh@gmail.com` | `REC-101` | `Password123!` | `/staff/dashboard` |

---

### 🏥 3.3 Hospital 2: CareConnect Metro Health Center (Coimbatore - `CC-METRO`)

#### 👨‍⚕️ Doctors (3 Doctors)
| Doctor Name | Specialization / Dept | Email | Doctor ID | Password | OPD Room | Status |
|---|---|---|---|---|---|---|
| **Dr. Suresh Verma** | Orthopedics & Joint Care | `suresh@gmail.com` | `DOC-201` | `Password123!` | Room 201 | Active |
| **Dr. Meena Krishnan** | Cardiology | `meena@gmail.com` | `DOC-202` | `Password123!` | Room 202 | Active |
| **Dr. Arun Prakash** | General Medicine | `arun@gmail.com` | `DOC-203` | `Password123!` | Room 203 | Active |

#### 👩‍⚕️ Nurses (2 Nurses)
| Nurse Name | Role | Department / Station | Email | Staff ID | Password | Target Dashboard |
|---|---|---|---|---|---|---|
| **Sister Saranya T, RN** | `NURSE` | General Ward & Triage | `saranya@gmail.com` | `NUR-201` | `Password123!` | `/staff/dashboard` |
| **Sister Kavya R, RN** | `NURSE` | OPD Triage Station 2 | `kavya@gmail.com` | `NUR-202` | `Password123!` | `/staff/dashboard` |

#### 💼 Receptionist (1 Receptionist)
| Name | Role | Department | Email | Staff ID | Password | Target Dashboard |
|---|---|---|---|---|---|---|
| **Karthik Pandian** | `RECEPTIONIST` | Front Desk & Patient Services | `karthik@gmail.com` | `REC-201` | `Password123!` | `/staff/dashboard` |

---

### 🧑 3.4 Registered Patient Accounts (5 Patients)
| Patient Name | Email | Password | Age / Gender | Blood Group | Live OPD / Consultation Status | Target Dashboard |
|---|---|---|---|---|---|---|
| **Murugan Swaminathan** | `murugan@gmail.com` | `Password123!` | 48, Male | B+ | Token `GMED-101` (Vitals Pending for Nurse) | `/patient/dashboard` |
| **Kavitha Rajendran** | `kavitha@gmail.com` | `Password123!` | 35, Female | O+ | Token `CARD-102` (Vitals Recorded for Dr. Priya) | `/patient/dashboard` |
| **Vignesh Manoharan** | `vignesh@gmail.com` | `Password123!` | 28, Male | A+ | Token `PEDI-103` (Dr. Rajesh Kumar) | `/patient/dashboard` |
| **Divya Sundaram** | `divya@gmail.com` | `Password123!` | 24, Female | AB+ | Appointment `APT-2026-202` (Hospital 2) | `/patient/dashboard` |
| **Selvam Palanisamy** | `selvam@gmail.com` | `Password123!` | 56, Male | O- | Token `ORTHO-201` (Hospital 2 - Ortho) | `/patient/dashboard` |

---

## 4. Role-Based Access Control (RBAC) Matrix

| Feature / Action | `PATIENT` | `RECEPTIONIST` | `DOCTOR` | `ADMIN` | `SUPER_ADMIN` |
|---|:---:|:---:|:---:|:---:|:---:|
| **Book OPD Appointment** | ✅ | ✅ (Walk-in Desk) | ❌ | ✅ | ✅ |
| **View Own Live Token Status** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Cancel Own Appointment** | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Confirm / Check-in Patient at Desk** | ❌ (Staff only) | ✅ | ✅ | ✅ | ✅ |
| **Reschedule / Change Appointment Time** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Call Next Patient in OPD Queue** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Write Clinical Prescription & Notes** | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Issue Invoices & Collect Billing** | ❌ | ✅ | ❌ | ✅ | ✅ |
| **Add / Manage Doctors & Staff** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Modify Hospital Operational Settings** | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 5. Core Modules & Operational Features

### 1. Patient Portal (`/patient/dashboard`)
- **Direct OPD Booking**: Select specialist doctor, consultation date, and preferred slot.
- **Appointment Approval Workflow**: Once booked, ticket displays as **Pending Confirmation** until the hospital front-desk verifies and confirms check-in.
- **Live Queue Counter**: Displays your token number (e.g. `CARD-004`), doctor consultation room number, and current token being examined in real time.
- **Self-Service Cancellation**: Patients can safely cancel pending tickets without complex hurdles.

### 2. Hospital Reception Console (`/staff/dashboard`)
- **Appointment Verification & Desk Check-In**: Front desk receptionists confirm patient arrivals, issue physical queue tokens, or reschedule appointment timings.
- **Date & Department Filtering**: Live reactive filters by date and clinical department (Cardiology, Neurology, Orthopedics, Pediatrics, General Medicine).
- **Walk-in Triage**: Instant walk-in token generation for non-registered emergency patients.

### 3. Doctor Consultation Desk (`/staff/dashboard`)
- **OPD Queue Calling**: View active patient queue, mark "In Consultation", and call the next token.
- **Digital Rx Writer**: Enter clinical observations, vitals, diagnosis, medication dosages, and follow-up schedules.
- **Medical History Access**: Direct inspection of previous hospital visits and lab prescriptions.

### 4. Hospital & System Administration
- **Staff Roster Management**: Provision new doctors, assign department heads, and manage employee accounts.
- **Audit Trails**: Full system audit log recording all logins, token state transitions, and administrative overrides.

---

## 6. Database Schema Overview

```
careconnect/
├── super_admins        # System owner records (Argon2id password hashes)
├── employees           # Doctors, Hospital Admins, and Receptionists
├── patients            # Dedicated clinical patient records
├── users               # Shared user identities & OAuth linkages
├── departments         # Clinical departments (Cardiology, Neurology, etc.)
├── doctors             # Specialist doctor profiles, fees & schedules
├── appointments        # Scheduled bookings & desk check-in statuses
├── tokens              # Daily live OPD queue triage tokens
├── invoices            # Billing, consultation fees & receipt statuses
└── audit_logs          # Immutable security and access event logs
```

---

## 7. Installation & Setup Guide

### 7.1 Prerequisites
- **Node.js**: `v20.x` or `v22.x` / `v24.x`
- **npm**: `v10+`
- **MongoDB Atlas** or Local MongoDB instance

### 7.2 Environment Configuration
Create a `.env` file in the project root with the following keys:
```env
NODE_ENV="development"
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.uurxkmz.mongodb.net/careconnect?retryWrites=true&w=majority"
MONGODB_DB_NAME="careconnect"

APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="CareConnect"

# Session Security Secrets
AUTH_SECRET="5a17c012b5370cda4b04a44e4fc378ead973f61b2f8337ec72fd85ecb0392c68"
JWT_SECRET="5a17c012b5370cda4b04a44e4fc378ead973f61b2f8337ec72fd85ecb0392c68"

# Super Admin Initial Bootstrap
SUPER_ADMIN_NAME="Chief System Administrator"
SUPER_ADMIN_EMAIL="admin@gmail.com"
SUPER_ADMIN_INITIAL_PASSWORD="Admin@123"
```

### 7.3 Installation & Seeding Commands
```bash
# 1. Install dependencies
npm install

# 2. Provision initial Super Admin
npm run bootstrap:super-admin

# 3. Seed 5 Clinical Departments, 5 Doctors, 5 Staff, and 5 Patients
npm run seed:staff

# 4. Start Development Server
npm run dev
```

The web application will be live at `http://localhost:3000`.

---

© 2026 CareConnect Health Systems. All rights reserved.
