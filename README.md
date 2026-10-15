# 🏥 CareConnect Health Systems — Enterprise Clinical Suite & Digital Queue Platform

**CareConnect** is an enterprise-grade Hospital Information Management System (HIMS), Outpatient Department (OPD) Triage Desk, Digital Token Queue, and Medical Invoicing Platform. Built with **Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, and MongoDB**, it provides role-based workspaces for Super Administrators, Hospital Admins, Clinicians (Doctors), Front Desk Receptionists, and Patients.

---

## 📑 Table of Contents
1. [Platform Architecture & Role Hierarchy](#-platform-architecture--role-hierarchy)
2. [Staff Side Operations (Role-by-Role)](#-staff-side-operations-role-by-role)
   - [Super Administrator](#1-super-administrator)
   - [Hospital Administrator](#2-hospital-administrator)
   - [Clinician / Doctor Desk](#3-clinician--doctor-desk)
   - [Receptionist & Front Desk Cashier](#4-receptionist--front-desk-cashier)
3. [Patient Portal Experience](#-patient-portal-experience)
4. [Master Modules Directory (20 Modules)](#-master-modules-directory-20-modules)
5. [Hardware, Device & Deployment Requirements](#-hardware-device--deployment-requirements)
6. [Security & Architectural Safeguards](#-security--architectural-safeguards)
7. [System Limitations & Enterprise Roadmap](#-system-limitations--enterprise-roadmap)
8. [Installation & Live Demo Seeding](#-installation--live-demo-seeding)

---

## 🏛 Platform Architecture & Role Hierarchy

CareConnect enforces a zero-trust multi-collection identity model with global email-collision prevention, separating clinical and administrative privileges:

```
                                  ┌─────────────────────────────┐
                                  │      CareConnect Cloud      │
                                  └──────────────┬──────────────┘
                                                 │
            ┌────────────────────────────────────┼────────────────────────────────────┐
            ▼                                    ▼                                    ▼
┌────────────────────────┐           ┌────────────────────────┐           ┌────────────────────────┐
│     PATIENT PORTAL     │           │   CLINICAL SUITE (OPD) │           │  ADMINISTRATIVE ENGINE │
│  (Verified Patients)   │           │   (Doctors & Triage)   │           │ (Admins & Super Admin) │
├────────────────────────┤           ├────────────────────────┤           ├────────────────────────┤
│ • My Live Ticket       │           │ • OPD Desk & Rx Pad    │           │ • Operations Hub       │
│ • Appointments Booking │           │ • Live Queue Console   │           │ • Unified Staff/Doctor │
│ • Health Vault & Rx    │           │ • Daily Appointments   │           │ • Billing & Cashier    │
│ • Bills & UPI QR Pay   │           │ • Duty Roster & Leave  │           │ • System Health & DB   │
│ • Doctor Reviews/CSAT  │           │ • Patient Testimonials │           │ • Hospital Profile     │
└────────────────────────┘           └────────────────────────┘           └────────────────────────┘
```

### Access Control Matrix

| Role | Default Landing Page | Primary Responsibilities |
| :--- | :--- | :--- |
| **SUPER_ADMIN** | `/staff/dashboard` (Operations Hub) | System health diagnostics, 1-click DB backup, hospital configurations, global governance |
| **ADMIN** | `/staff/dashboard` (Operations Hub) | Department management, unified staff & doctor provisioning, leave approvals, financial ledger |
| **DOCTOR** | `/staff/dashboard` (OPD Desk & Rx Pad) | Patient consultations, e-Prescription issuance with vitals, live room calling, personal roster |
| **RECEPTIONIST**| `/staff/dashboard` (Front Desk & Triage) | Walk-in patient registration, fast token triage, cashier desk, bill settlements, receipt printing |
| **PATIENT** | `/patient/dashboard` (Patient Overview) | Booking specialist consultations, tracking live ticket wait time, paying dues via UPI, Rx vault |

---

## 👩‍⚕️ Staff Side Operations (Role-by-Role)

### 1. Super Administrator
- **Hospital Profile & Multi-Branch Config** ([`HospitalProfileView.tsx`](file:///d:/kaizen/Collage%20project/CareConnect/src/components/hospital/HospitalProfileView.tsx)): Configures hospital trade name, NABH registration number, 24x7 emergency helpline, OPD hours, and brand header.
- **Backup & System Maintenance** ([`SystemMaintenanceManager.tsx`](file:///d:/kaizen/Collage%20project/CareConnect/src/components/system/SystemMaintenanceManager.tsx)):
  - 1-Click JSON Snapshot Export (`/api/system/backup`) containing all collections (Doctors, Departments, Patients, Appointments, Tokens, Invoices).
  - Real-time MongoDB connection latency and memory telemetry (`/api/system/health`).
  - 90-day automated audit log retention policy enforcement.

### 2. Hospital Administrator
- **Operations Hub Dashboard**: Live KPI counters for Today's Appointments, Checked-In Patients, In-Consultation Queue, and Total Hospital Revenue.
- **Unified Staff & Doctor Management** ([`StaffDoctorManager.tsx`](file:///d:/kaizen/Collage%20project/CareConnect/src/components/staff/StaffDoctorManager.tsx)): Provision clinicians and hospital receptionists in a unified full-width single-card console with auto-credential generation (`DOC-xxx`, `REC-xxx`), password hashing, department linking, and consultation fee assignment.
- **Doctor Shift & Leave Approvals** ([`DoctorScheduleManager.tsx`](file:///d:/kaizen/Collage%20project/CareConnect/src/components/doctor/DoctorScheduleManager.tsx)): Approve/Reject casual, medical, or conference leaves and verify locum doctor coverage.
- **Clinical Analytics & CSV Export** ([`AnalyticsReports.tsx`](file:///d:/kaizen/Collage%20project/CareConnect/src/components/analytics/AnalyticsReports.tsx)): Downloadable operational reports for audit compliance.

### 3. Clinician / Doctor Desk
- **My OPD Desk & Rx Pad** ([`DoctorConsultationDesk.tsx`](file:///d:/kaizen/Collage%20project/CareConnect/src/components/doctor/DoctorConsultationDesk.tsx)):
  - Dedicated consultation workstation: displays attending patient vitals (Blood Pressure, Pulse, Temperature, Weight).
  - Diagnostic clinical notes and ICD-compliant complaint recording.
  - Interactive e-Prescription builder: Medicine name, dosage (e.g. `500mg`), frequency (`1-0-1`), duration (`5 Days`), and dietary instructions (`After food`).
  - 1-Click "Complete Consultation & Advance Queue" button.
- **My Roster & Leave Application**: View assigned morning (`09:00 AM - 01:00 PM`) and evening (`05:00 PM - 08:00 PM`) clinic slots; apply for leave with replacement specialist assignment.
- **Doctor Scorecards & Reviews** ([`FeedbackReviewManager.tsx`](file:///d:/kaizen/Collage%20project/CareConnect/src/components/feedback/FeedbackReviewManager.tsx)): Review verified patient testimonials, waiting-time scores, and 5-star clinical satisfaction ratings.

### 4. Receptionist & Front Desk Cashier
- **Front Desk & Triage Hub** ([`ReceptionistDesk.tsx`](file:///d:/kaizen/Collage%20project/CareConnect/src/components/reception/ReceptionistDesk.tsx)):
  - Fast-Track Walk-in Token generator (Name, Phone, Department, Specialist, Normal/Emergency Priority).
  - 1-Click Patient Check-in for today's scheduled appointment arrivals.
  - Active Doctor Room Glance (Specialization, assigned OPD Room No, current duty status).
- **Hospital Billing & Cashier Desk** ([`HospitalBillingManager.tsx`](file:///d:/kaizen/Collage%20project/CareConnect/src/components/billing/HospitalBillingManager.tsx)):
  - Real-time Cash Drawer KPI (Physical cash collected vs Bank Direct UPI / Card settlements).
  - Outstanding Dues Ledger: Filter unpaid balances and collect pending fees.
  - Auto-calculated itemized invoices: Doctor consultation fee + Hospital OPD Registration card charges.
- **Official Medical Tax Receipts** ([`InvoiceReceiptModal.tsx`](file:///d:/kaizen/Collage%20project/CareConnect/src/components/billing/InvoiceReceiptModal.tsx)): Instant print-ready receipts with hospital accreditation watermark, patient UHID, doctor specialization, UTR tracking code, and cashier authorization stamp.
- **Full-Screen Waiting Room TV Display Mode**: Launches high-contrast, dark-mode TV display (`#0F172A`) showing `NOW CALLING`, room numbers, and next waiting tokens with audio notifications.

---

## 🧑‍💼 Patient Portal Experience

Designed for clean mobile and desktop usability to reduce hospital lobby congestion:

1. **Patient Overview Hub**:
   - Displays verified patient identity badge, next scheduled consultation reminder, and one-tap emergency trauma dispatch link.
2. **Live Queue & Token Status ("My Live Ticket")**:
   - Shows active token number (e.g. `A-01`), attending doctor name, and clinic room number.
   - **Algorithmic Waiting-Time Estimation**: Real-time projection ($T_{wait} = \text{Queue Position} \times 10\text{ mins}$) showing `~15 - 20 mins` and `2 Patients Ahead of You`.
3. **Specialist Appointment Booking**:
   - Filter by Medical Department (Cardiology, Neurology, Pediatrics, etc.) and view doctor profiles with consultation fees.
   - Auto-filled verified credentials (Name, Phone, Email) with date-picker and available time-slots.
4. **Bills, Invoices & Tax Receipts** ([`PatientBillsView.tsx`](file:///d:/kaizen/Collage%20project/CareConnect/src/components/patient/PatientBillsView.tsx)):
   - **Pending Due Alert Banner**: Displays outstanding consultation fees prominently.
   - **Instant Dynamic UPI QR Code**: Generates hospital VPA (`careconnect@icici`) payment QR compatible with PhonePe, Google Pay, and Paytm with pre-filled amount.
   - **Print / Download E-Receipt**: Tax invoice valid for corporate and health insurance claims.
5. **Medical Prescriptions Vault** ([`PrescriptionVault.tsx`](file:///d:/kaizen/Collage%20project/CareConnect/src/components/patient/PrescriptionVault.tsx)):
   - Permanent digital health vault storing all past prescriptions, diagnostic lab investigation orders, and doctor advice.
6. **Doctor Reviews & Ratings**:
   - 5-Star post-consultation evaluation rating clinical care, waiting time, and clinic hygiene.

---

## 📦 Master Modules Directory (20 Modules)

| No. | Module Name | Primary User | Core Capabilities |
| :---: | :--- | :--- | :--- |
| **01** | **Authentication & Security** | All Users | Multi-collection isolation (`super_admins` vs `users`), Argon2id hashing, Google OAuth2, HTTP-only signed cookies. |
| **02** | **Role-Based Access Control** | All Users | Granular permissions separating Doctor, Receptionist, Admin, Super Admin, and Patient route handlers. |
| **03** | **Operations Dashboard** | Admin | Real-time clinic statistics, triage volume, live queue capacity, and revenue summary. |
| **04** | **Specialist Directory** | All Users | Clinician credentials, experience years, department affiliations, and consultation fees. |
| **05** | **Staff & Doctor Provisioning** | Admin | Unified onboarding for doctors and front-desk personnel with credentials generation. |
| **06** | **Digital Token Queue** | Reception / Doctor | Token generation (`A-01` to `A-10`), Calling Room, In-Consultation, and Completed states. |
| **07** | **Doctor OPD Workstation** | Doctor | Stethoscope desk, patient vitals monitoring, diagnosis recording, and Rx prescription generator. |
| **08** | **Receptionist Triage Desk** | Receptionist | Walk-in patient triage, 1-click appointment check-in, on-duty clinician room overview. |
| **09** | **Full-Screen TV Display** | Waiting Area | Broadcast-grade TV display with high contrast and real-time token calling status. |
| **10** | **In-App Notification Center** | All Users | Real-time alert bell with unread count badges, audio chimes, and mark-all-read capabilities. |
| **11** | **Prescriptions Health Vault** | Patient | Permanent electronic health vault for digital prescriptions and lab test recommendations. |
| **12** | **Clinical Analytics & Reports** | Admin | OPD volume charts, queue wait times, doctor workload, and one-click CSV data export. |
| **13** | **Schedule & Slot Management** | Doctor / Admin | Doctor shift configuration (Morning/Evening), weekly rosters, and leave approvals with locum replacement. |
| **14** | **Walk-in Management** | Receptionist | Instant walk-in token issuance with emergency priority bypass for trauma cases. |
| **15** | **Waiting-Time Estimation** | Patient / TV | Dynamic queue wait algorithm: $T_{wait} = (\text{Position} - 1) \times \bar{D}_{\text{consult}}$. |
| **16** | **Feedback & CSAT Ratings** | Patient / Admin | Post-consultation 5-star scoring, cleanliness ratings, and doctor scorecards. |
| **17** | **Payment & Invoicing** | Reception / Patient | Cashier desk, Cash/UPI/Card POS settlement, Dynamic UPI QR code, printable medical tax receipt. |
| **18** | **Hospital Profile & Config** | Super Admin | Hospital name branding, NABH licensing number, working hours, and 24x7 emergency phone config. |
| **19** | **Profile & Preferences** | All Users | Profile inspection, SHA-256 password reset, email alerts, and queue audio chime toggles. |
| **20** | **Backup & System Maintenance**| Super Admin | 1-Click JSON database archive export, MongoDB health telemetry, and 90-day audit log purge. |

---

## 💻 Hardware, Device & Deployment Requirements

| Device Type | Intended User / Location | Minimum Recommended Specifications |
| :--- | :--- | :--- |
| **Desktop / Laptop PC** | Administrative Office, Cashier Counter, Doctor Consultation Room | Modern web browser (Chrome, Edge, Firefox, Safari), 4GB RAM, 1080p display resolution |
| **Touch Tablet (iPad / Android)** | Front Desk Triage, Bedside Clinical Rounds | 10-inch screen or higher, touchscreen support for rapid patient check-in |
| **Smart TV / HDMI Monitor** | Outpatient Waiting Hall, Lobby Ceiling Mounts | 43-inch to 65-inch Full HD (1920x1080) Smart TV or Mini-PC HDMI stick running Chrome in fullscreen kiosk mode |
| **Mobile Smartphones** | Outpatient Patients & Relatives | iOS 14+ or Android 10+ running any mobile browser; supports camera for UPI QR scanning |
| **Receipt Printers** | Hospital Cashier Desk | Standard thermal POS printer (80mm / 3-inch) or standard A4 laser printer via browser print dialog |

---

## 🔒 Security & Architectural Safeguards

1. **Zero-Trust Multi-Collection Storage**:
   - `super_admins`: Isolated platform administration partition. No public registration route exists.
   - `users`: Platform employees and clinical staff with strict role guards.
   - `patients`: Outpatient accounts with normalized email indexing and self-service portals.
2. **OWASP Cryptographic Standards**:
   - Password hashing utilizes **Argon2id** (`@node-rs/argon2`) configured with memory cost `19456` (19 MiB), time cost `2`, and parallelism `1`.
3. **Signed HTTP-Only Session Security**:
   - Cookie-based session token (`careconnect_session`) cryptographically signed using SHA-256 HMAC with constant-time comparison against timing attacks.
4. **Global Input Sanitization**:
   - Strict server-side runtime boundary validation using **Zod** on every REST API route.
5. **Rate Limiting Engine**:
   - Sliding-window in-memory rate limiting on authentication routes (maximum 10 requests per 60 seconds) to mitigate brute-force credential stuffing.

---

## ⚠️ System Limitations & Enterprise Roadmap

- **ESC/POS Direct Raw Printing**: Current receipts render in browser-standard `@media print` styling (compatible with both A4 and 80mm thermal printers). Future iterations will support direct USB/Network ESC/POS raw socket printing without browser print dialogs.
- **SMS Gateway Provider**: Notification architecture includes in-app alerts and console email dispatch. Integrating third-party SMS providers (Twilio, Gupshup, Kaleyra) requires setting active API keys.
- **Tele-Consultation WebRTC**: Video consultation rooms for remote follow-ups are slated for the v2.2 milestone.
- **Biometric Integration**: Currently supports Google OAuth2 and credentials; finger-scanner hardware integration requires client-side WebAuthn drivers.

---

## 🚀 Installation & Live Demo Seeding

### Prerequisites
- Node.js `v20.x` or higher
- MongoDB Atlas cluster or local MongoDB instance (`v6.0+`)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-org/careconnect.git
cd careconnect
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```env
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/careconnect?retryWrites=true&w=majority"
APP_URL="http://localhost:3000"
AUTH_SECRET="careconnect-ultra-secure-auth-secret-32-chars-long-test-key-2026"

# Google OAuth 2.0 (Optional for Social Login)
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# Super Admin Initial Credentials
SUPER_ADMIN_NAME="Chief System Administrator"
SUPER_ADMIN_EMAIL="admin@gmail.com"
SUPER_ADMIN_INITIAL_PASSWORD="Admin@123"

# Email Provider
EMAIL_PROVIDER="console"
EMAIL_FROM="CareConnect Identity <noreply@careconnect.health>"
```

### 3. Seed Live Enterprise Demo Data (10 Records Per Module)
Populate the database with 10 realistic departments, doctors, patients, appointments, queue tokens, invoices, schedules, and reviews:
```bash
npx tsx scripts/seed-enterprise-demo.ts
```

### 4. Run Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 5. Run Automated Test Suite
Execute the 24 unit and integration tests:
```bash
npm test
```

---

## 👥 Default Demo Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@gmail.com` | `Admin@123` | Full System Governance, Backup & Settings |
| **Hospital Admin** | `admin@careconnect.local` | `Password123!` | Operations Hub, Staff/Doctor Provisioning |
| **Specialist Doctor** | `sarah.jenkins@careconnect.health` | `Password123!` | OPD Desk, Rx Pad, Live Queue Calling |
| **Front Desk Cashier**| `reception@careconnect.local` | `Password123!` | Walk-ins, Cashier Desk, Token Calling |
| **Registered Patient** | `arunachalam@example.com` | `Password123!` | Live Ticket, Bookings, UPI Bills & Vault |

---

<div align="center">
  <sub>Developed for Clinical Excellence with CareConnect Health Systems • Certified Enterprise Hospital ERP Architecture</sub>
</div>
