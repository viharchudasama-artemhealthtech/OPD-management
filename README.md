# OPD Management

A full-featured **Outpatient Department (OPD)** management web application built with **Angular 17**. It provides dedicated, role-locked portals for Admins, Receptionists, Doctors, and Patients — covering the complete clinical workflow from registration to consultation and billing.

---

## ✨ Features by Role

### 🔐 Authentication
- Single login page (`/auth/login`) with session-based access control.
- Route protection via **`authGuard`** (login check) and **`roleGuard`** (role enforcement).

### 👑 Admin (`/admin`)
| Page | Route | Description |
|---|---|---|
| Dashboard | `/admin/dashboard` | System-wide analytics and activity summary |
| Patients | `/admin/patients` | Read-only view of all registered patients |
| Users | `/admin/users` | Manage staff accounts (create, update, roles) |

### 🧾 Receptionist (`/receptionist`)
| Page | Route | Description |
|---|---|---|
| Dashboard | `/receptionist/dashboard` | Daily stats and quick-action panel |
| Patient List | `/receptionist/patients` | Search and browse registered patients |
| OPD Check-in | `/receptionist/checkin` | Token generation and walk-in/scheduled check-in |
| Appointments | `/receptionist/appointments` | Schedule and manage patient appointments |
| Vitals Entry | `/receptionist/vitals/:patientId` | Record patient vitals (shared with Doctor) |
| Billing | `/receptionist/billing` | Generate and manage patient bills |
| Prescriptions | `/receptionist/prescriptions` | View all prescriptions (shared with Doctor) |

### 👨‍⚕️ Doctor (`/doctor`)
| Page | Route | Description |
|---|---|---|
| Queue | `/doctor/queue` | Live patient queue for the day |
| Appointments | `/doctor/appointments` | View scheduled appointments |
| Consultation | `/doctor/consultation/:tokenId` | Full consultation view linked to a token |
| Prescriptions | `/doctor/prescriptions` | Browse all issued prescriptions |

### 🧑 Patient — Registration (`/patient`)
| Page | Route | Description |
|---|---|---|
| Registration | `/patient/registration` | New patient onboarding form |
| Patient List | `/patient/list` | View registered patients |
| Dashboard | `/patient/dashboard` | Summary view |

### 🏥 Patient Portal (`/patient-portal`) *(Patient role only)*
| Page | Route | Description |
|---|---|---|
| My Dashboard | `/patient-portal` | Personal activity overview |
| Book Appointment | `/patient-portal/book` | Self-service appointment booking |
| My Appointments | `/patient-portal/appointments` | View own appointment history |
| Appointment Details | `/patient-portal/appointments/:id` | Details for a specific appointment |
| My Bills | `/patient-portal/bills` | View generated bills |
| My Prescriptions | `/patient-portal/prescriptions` | View prescriptions from doctor |

---

## 🛠️ Technology Stack

| Category | Technology | Version |
|---|---|---|
| Framework | [Angular](https://angular.io/) | 17.3.x |
| UI Components | [PrimeNG](https://primeng.org/) | 17.18.x |
| Layout System | [PrimeFlex](https://primeflex.org/) | 4.x |
| Icons | [PrimeIcons](https://primeng.org/icons) | 7.x |
| Charts | [Chart.js](https://www.chartjs.org/) | 4.x |
| Reactive State | [RxJS](https://rxjs.dev/) | 7.8.x |
| PDF Export | [jsPDF](https://parall.ax/products/jspdf) | 4.x |
| Excel Export | [XLSX (SheetJS)](https://sheetjs.com/) | 0.18.x |
| QR Codes | [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) | 2.x |
| Language | TypeScript | 5.4.x |
| Testing | Karma + Jasmine | — |
| Linting | ESLint + angular-eslint | — |
| Formatting | Prettier | 3.x |

---

## 📂 Project Structure

```
src/
├── app/
│   ├── app.routes.ts           # Root router (lazy-loaded, guarded)
│   ├── app.config.ts           # Angular application config
│   │
│   ├── core/                   # Singleton, app-wide logic
│   │   ├── constants/          # Application-wide constants
│   │   ├── guards/
│   │   │   ├── auth.guard.ts   # Redirects unauthenticated users to login
│   │   │   └── role.guard.ts   # Blocks access based on UserRole enum
│   │   ├── interceptors/
│   │   │   └── global-error.interceptor.ts
│   │   ├── mocks/              # Fake data for development/testing
│   │   ├── models/             # TypeScript interfaces & enums
│   │   │   ├── patient.model.ts
│   │   │   ├── user.model.ts
│   │   │   ├── appointment.model.ts
│   │   │   ├── billing.model.ts
│   │   │   ├── clinical.model.ts
│   │   │   ├── opd.model.ts
│   │   │   ├── vitals.model.ts
│   │   │   ├── system-settings.model.ts
│   │   │   └── enums/          # (11 enums: Role, Status, Gender, BloodGroup, Dept, etc.)
│   │   ├── repositories/       # Data access layer (local storage / fake backend)
│   │   └── services/
│   │       ├── analytics.service.ts
│   │       ├── user.service.ts
│   │       ├── notification.service.ts
│   │       ├── activity.service.ts
│   │       ├── data-sync.service.ts
│   │       ├── system-settings.service.ts
│   │       ├── logger.service.ts
│   │       └── error-handler.service.ts
│   │
│   ├── features/               # Feature modules (one folder per role/domain)
│   │   ├── auth/               # Login page
│   │   ├── dashboard/          # Shared dashboard (all authenticated roles)
│   │   ├── admin/              # Admin-only pages + services
│   │   ├── receptionist/       # Receptionist pages + services + repositories
│   │   ├── doctor/             # Doctor pages + services
│   │   ├── patient/            # Patient registration & management
│   │   ├── patient-portal/     # Self-service portal for patient role
│   │   ├── nursing/            # Vitals entry (shared with receptionist/doctor)
│   │   └── user/               # User profile page
│   │
│   └── shared/                 # Reusable UI building blocks
│       ├── components/
│       │   ├── layout/         # App shell (wraps all authenticated routes)
│       │   ├── sidebar/        # Navigation sidebar
│       │   ├── header/         # Top navigation bar
│       │   └── unauthorized/   # 403 page
│       ├── directives/         # Custom Angular directives
│       └── pipes/              # Custom pipes (Age, Phone formatting, etc.)
│
└── styles.scss                  # Global styles + PrimeNG theme overrides
```

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js** ≥ 18.x — [Download](https://nodejs.org/)
- **Angular CLI** — `npm install -g @angular/cli`

### Installation
```bash
# 1. Clone the repository
git clone <repository-url>
cd OPD-management

# 2. Install dependencies
npm install

# 3. Start the development server
npm start
```

Open **http://localhost:4200** in your browser. The app hot-reloads on file changes.

---

## 🧰 Available Scripts

| Command | Description |
|---|---|
| `npm start` | Start dev server at `localhost:4200` |
| `npm run build` | Build production bundle → `dist/` |
| `npm test` | Run unit tests with Karma |
| `npm run lint` | Run ESLint checks |
| `npm run format` | Auto-format with Prettier |

---

## 🏗️ Architecture Notes

- **Lazy Loading**: Every feature module is lazy-loaded via the Angular Router, keeping the initial bundle small.
- **Role-Based Guards**: Two functional guards (`authGuard`, `roleGuard`) protect every route. The `UserRole` enum defines: `ADMIN`, `RECEPTIONIST`, `DOCTOR`, `PATIENT`.
- **Data Layer**: The `repositories/` directories (in `core` and each feature) abstract the data access logic, making it straightforward to swap the current local-storage/mock backend with real API calls.
- **Shared Nursing Module**: The `VitalsEntryComponent` is a cross-cutting feature reused by both receptionist and doctor routes.
- **Global Error Handling**: A `GlobalErrorInterceptor` + `ErrorHandlerService` provide centralized error management.

---

## 🧪 Testing

Unit tests are written with **Jasmine** and run via **Karma**:
```bash
npm test
```

---

## 📐 Code Quality

This project enforces consistency with:
- **ESLint** (`@angular-eslint`) — Run: `npm run lint`
- **Prettier** — Run: `npm run format`

Both should pass before opening a pull request.
