# OPD Management System

A comprehensive Outpatient Department (OPD) management system built with **Angular 17** and **PrimeNG**. This application streamlines clinical workflows, from patient registration and appointment scheduling to doctor consultations and patient portal access.

## 🚀 Features

### 👤 Role-Based Access Control
The system supports multiple user roles with specific access levels:
- **Admin**: Full system access, including user management and system settings.
- **Receptionist**: Patient registration, appointment scheduling, and OPD check-in.
- **Doctor**: Appointment management and patient consultation tracking.
- **Patient**: Dedicated portal for booking appointments and managing profiles.

### 📋 Key Functionalities
- **Patient Management**: Complete registration workflow with validation and unique ID generation.
- **Appointment Scheduling**: Interactive booking system for both receptionists and patients.
- **OPD Check-in**: Real-time token generation and check-in processing for walk-ins and scheduled appointments.
- **Dashboard & Analytics**: Visual representation of clinic activities using **Chart.js**.
- **Reporting & Exports**: Export data to **Excel (XLSX)** and generate **PDF** slips or reports.
- **Interactive UI**: Modern, responsive design using **PrimeNG** components and **PrimeFlex** layout system.

## 🛠️ Technology Stack

- **Framework**: [Angular 17](https://angular.io/)
- **UI Components**: [PrimeNG](https://primeng.org/)
- **Icons**: [PrimeIcons](https://primeng.org/icons)
- **Styling**: [PrimeFlex](https://primeflex.org/) & SCSS
- **Charts**: [Chart.js](https://www.chartjs.org/)
- **State Management**: [RxJS](https://rxjs.dev/) (Reactive Streams)
- **Utilities**:
  - `jspdf`: For PDF generation.
  - `xlsx`: For Excel data exports.
  - `qrcode-generator`: For patient/token QR codes.

## 📂 Project Structure

```text
src/app/
├── core/               # Core singleton services, guards, and models
│   ├── guards/         # Auth and Role guards
│   ├── models/         # TypeScript interfaces and enums
│   ├── repositories/   # Data access layer (Fake Backend/Storage)
│   └── services/       # Business logic and state management
├── features/           # Feature-specific modules and components
│   ├── admin/          # Admin-only pages
│   ├── auth/           # Login and authentication flow
│   ├── dashboard/      # Main activity dashboard
│   ├── doctor/         # Doctor-specific workflows
│   ├── patient/        # Patient management (Receptionist view)
│   ├── patient-portal/ # Self-service portal for patients
│   └── receptionist/   # Receptionist workflows (scheduling, check-in)
├── shared/             # Reusable components, directives, and pipes
│   ├── components/     # Layout, Sidebar, Header, etc.
│   ├── directives/     # Custom directives (e.g., AutoNext)
│   └── pipes/          # Custom formatting pipes (e.g., Age, Phone)
└── styles.scss         # Global styles and PrimeNG overrides
```

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)

### Installation
1. Clone the repository:
   ```bash
   git clone [repository-url]
   ```
2. Navigate to the project directory:
   ```bash
   cd OPD-management
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application
To start a local development server:
```bash
npm start
```
Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Building for Production
To build the project for production:
```bash
npm run build
```
The build artifacts will be stored in the `dist/` directory.

## 🧪 Testing
Run unit tests via [Karma](https://karma-runner.github.io):
```bash
npm test
```

## 👨‍💻 Development Guidelines
- **Coding Standards**: All files should adhere to the project's Prettier and ESLint configurations.
- **Formatting**: Run `npm run format` before committing changes.
- **Linting**: Run `npm run lint` to check for code quality issues.
