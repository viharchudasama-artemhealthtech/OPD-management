import { Injectable } from '@angular/core';
import { Appointment } from '../../../core/models/appointment.model';
import { DataSyncService } from '../../../core/services/data-sync.service';

/**
 * AppointmentRepository
 * 
 * Responsibilities:
 * - Direct interaction with storage (LocalStorage via DataSyncService)
 * - Low-level CRUD operations for Appointment entities
 */
@Injectable({
    providedIn: 'root',
})
export class AppointmentRepository {
    private readonly STORAGE_KEY = 'appointments';

    constructor(private readonly dataSync: DataSyncService) { }

    /**
     * Get all appointments from storage
     */
    public getAppointments(): Appointment[] {
        return this.dataSync.getItem<Appointment[]>(this.STORAGE_KEY, []);
    }

    /**
     * Persist appointment list to storage
     */
    public saveAppointments(appointments: Appointment[]): void {
        this.dataSync.setItem(this.STORAGE_KEY, appointments);
    }

    /**
     * Get appointments for a specific patient
     */
    public getAppointmentsByPatient(patientId: string): Appointment[] {
        return this.getAppointments().filter(a => a.patientId === patientId);
    }

    /**
     * Get appointments for a specific doctor
     */
    public getAppointmentsByDoctor(doctorId: string): Appointment[] {
        return this.getAppointments().filter(a => a.doctorId === doctorId);
    }
}
