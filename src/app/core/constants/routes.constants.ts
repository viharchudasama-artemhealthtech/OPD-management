/**
 * Centralized Route Constants
 *
 * Standardized constants and enums for all application routes.
 * Prevents hard-coded strings and ensures type-safe navigation.
 */

export const ROUTES = {
    // Root Level
    AUTH: 'auth',
    DASHBOARD: 'dashboard',
    PATIENT: 'patient',
    DOCTOR: 'doctor',
    ADMIN: 'admin',
    RECEPTIONIST: 'receptionist',
    PATIENT_PORTAL: 'patient-portal',
    PROFILE: 'profile',
    UNAUTHORIZED: 'unauthorized',

    AUTH_LOGIN: 'login',

    ADMIN_DASHBOARD: 'dashboard',
    ADMIN_PATIENTS: 'patients',
    ADMIN_USERS: 'users',

    RECEPTIONIST_DASHBOARD: 'dashboard',
    RECEPTIONIST_CHECKIN: 'check-in',
    RECEPTIONIST_SCHEDULING: 'scheduling',
    RECEPTIONIST_PATIENTS: 'patients',

    PATIENT_DASHBOARD: 'dashboard',
    PATIENT_REGISTER: 'register',

    DOCTOR_DASHBOARD: 'dashboard',
    DOCTOR_QUEUE: 'queue',
    DOCTOR_APPOINTMENTS: 'appointments',
    DOCTOR_CONSULTATION: 'consultation/:id',

    PATIENT_PORTAL_DASHBOARD: 'dashboard',
    PATIENT_PORTAL_HISTORY: 'history',
    PATIENT_PORTAL_BOOK: 'book',
} as const;

/**
 * Full Path Enums for Navigation
 */
export enum AppRoutes {
    LOGIN = '/auth/login',
    DASHBOARD = '/dashboard',
    UNAUTHORIZED = '/unauthorized',

    // Admin
    ADMIN_DASHBOARD = '/admin/dashboard',
    ADMIN_PATIENTS = '/admin/patients',
    ADMIN_USERS = '/admin/users',

    // Doctor
    DOCTOR_DASHBOARD = '/doctor/dashboard',
    DOCTOR_QUEUE = '/doctor/queue',
    DOCTOR_APPOINTMENTS = '/doctor/appointments',

    // Receptionist
    RECEPTIONIST_DASHBOARD = '/receptionist/dashboard',
    RECEPTIONIST_CHECKIN = '/receptionist/check-in',
    RECEPTIONIST_SCHEDULING = '/receptionist/scheduling',
    RECEPTIONIST_PATIENTS = '/receptionist/patients',

    // Patient Portal
    PATIENT_PORTAL_DASHBOARD = '/patient-portal/dashboard',
    PATIENT_PORTAL_HISTORY = '/patient-portal/history',
    PATIENT_PORTAL_BOOK = '/patient-portal/book',

    // Profile
    PROFILE = '/profile',
}
