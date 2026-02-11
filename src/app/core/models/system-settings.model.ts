export interface SystemSettings {
    general: {
        systemName: string;
        systemUrl: string;
        timezone: string;
        systemEmail: string;
        adminEmail: string;
        maintenanceMode: boolean;
        maintenanceMessage: string;
    };
    backup: {
        autoBackup: boolean;
        backupFrequency: string;
        backupRetention: number;
        backupLocation: string;
        compressBackup: boolean;
        encryptBackup: boolean;
        backupNotification: boolean;
    };
    security: {
        sessionTimeout: number;
        passwordMinLength: number;
        passwordExpiry: number;
        maxLoginAttempts: number;
        lockoutDuration: number;
        requireTwoFactor: boolean;
        logLevel: string;
        auditLogging: boolean;
        ipWhitelist: string;
    };
}
