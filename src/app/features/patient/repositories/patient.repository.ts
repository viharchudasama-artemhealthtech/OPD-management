import { Injectable } from '@angular/core';
import { Patient } from '../../../core/models/patient.model';
import { DataSyncService } from '../../../core/services/data-sync.service';

/**
 * PatientRepository
 * 
 * Responsibilities:
 * - Direct interaction with storage (LocalStorage via DataSyncService)
 * - Low-level CRUD operations for Patient entities
 */
@Injectable({
    providedIn: 'root',
})
export class PatientRepository {
    private readonly STORAGE_KEY = 'patients';

    constructor(private readonly dataSync: DataSyncService) { }

    /**
     * Get all patients from storage
     */
    public getPatients(): Patient[] {
        return this.dataSync.getItem<Patient[]>(this.STORAGE_KEY, []);
    }

    /**
     * Persist patient list to storage
     */
    public savePatients(patients: Patient[]): void {
        this.dataSync.setItem(this.STORAGE_KEY, patients);
    }

    /**
     * Get a single patient by ID
     */
    public getPatientById(id: string): Patient | undefined {
        return this.getPatients().find(p => p.id === id);
    }

    /**
     * Get a patient by phone number (for duplicate checks)
     */
    public getPatientByPhone(phone: string): Patient | undefined {
        return this.getPatients().find(p => p.phone === phone);
    }
}
