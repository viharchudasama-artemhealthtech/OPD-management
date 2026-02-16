import { BaseEntity } from './base.model';

export interface Vitals extends BaseEntity {
    patientId: string;
    appointmentId?: string;
    visitId?: string;
    recordedBy: string; // User ID
    recordedAt: Date;

    temperature?: number; // In Fahrenheit
    pulse?: number; // beats per minute
    bloodPressure?: {
        systolic: number;
        diastolic: number;
    };
    respiratoryRate?: number; // breaths per minute
    spo2?: number; // Percentage
    weight?: number; // kg
    height?: number; // cm
    bmi?: number;
    notes?: string;
}
