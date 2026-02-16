import { BaseEntity } from './base.model';

export interface Prescription extends BaseEntity {
    patientId: string;
    doctorId: string;
    visitId: string;
    date: Date;

    medicines: PrescriptionItem[];
    instructions?: string;
    followUpDate?: Date;
    appointmentId?: string;
}

export interface PrescriptionItem {
    medicineName: string;
    dosage: string; // e.g., "500mg"
    frequency: string; // e.g., "1-0-1"
    duration: string; // e.g., "5 days"
    timing: 'BEFORE_FOOD' | 'AFTER_FOOD' | 'WITH_FOOD' | 'EMPTY_STOMACH';
    route: 'ORAL' | 'TOPICAL' | 'INHALATION' | 'INJECTION';
    totalQuantity: number;
}

export interface ClinicalNote extends BaseEntity {
    patientId: string;
    doctorId: string;
    visitId: string;
    date: Date;

    complaints: string[];
    history?: string;
    examination?: string;
    diagnosis?: string;
    plan?: string;
    appointmentId?: string;
}
