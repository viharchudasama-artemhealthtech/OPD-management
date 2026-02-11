import { SystemSettings } from '../models/system-settings.model';

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
    general: {
        systemName: 'OPD Management System',
        systemUrl: 'http://localhost:4200',
        timezone: 'Asia/Kolkata',
        systemEmail: 'admin@opd.local',
        adminEmail: 'superadmin@opd.local',
        maintenanceMode: false,
        maintenanceMessage: 'System is under maintenance. Please try again later.',
    },
    backup: {
        autoBackup: true,
        backupFrequency: 'daily',
        backupRetention: 30,
        backupLocation: '/backups',
        compressBackup: true,
        encryptBackup: true,
        backupNotification: true,
    },
    security: {
        sessionTimeout: 30,
        passwordMinLength: 8,
        passwordExpiry: 90,
        maxLoginAttempts: 5,
        lockoutDuration: 15,
        requireTwoFactor: false,
        logLevel: 'info',
        auditLogging: true,
        ipWhitelist: '',
    },
};
