import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ClinicalNote, Prescription } from '../../../core/models/clinical.model';
import { ClinicalRepository } from '../repositories/clinical.repository';

@Injectable({
    providedIn: 'root',
})
export class ClinicalService {
    private readonly notesSubject = new BehaviorSubject<ClinicalNote[]>([]);
    private readonly prescriptionsSubject = new BehaviorSubject<Prescription[]>([]);

    public readonly notes$ = this.notesSubject.asObservable();
    public readonly prescriptions$ = this.prescriptionsSubject.asObservable();

    constructor(private readonly clinicalRepository: ClinicalRepository) {
        this.refreshData();
    }

    public refreshData(): void {
        this.notesSubject.next(this.clinicalRepository.getNotes());
        this.prescriptionsSubject.next(this.clinicalRepository.getPrescriptions());
    }

    public recordClinicalNote(note: Omit<ClinicalNote, 'id' | 'createdAt' | 'updatedAt'>): void {
        const newNote: ClinicalNote = {
            ...note,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.clinicalRepository.addNote(newNote);
        this.refreshData();
    }

    public recordPrescription(prescription: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>): void {
        const newPrescription: Prescription = {
            ...prescription,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.clinicalRepository.addPrescription(newPrescription);
        this.refreshData();
    }

    public getClinicalHistory(patientId: string): ClinicalNote[] {
        return this.clinicalRepository.getNotesByPatient(patientId);
    }

    public getPatientPrescriptions(patientId: string): Prescription[] {
        return this.clinicalRepository.getPrescriptionsByPatient(patientId);
    }

    public getNotesByVisit(visitId: string): ClinicalNote[] {
        return this.clinicalRepository.getNotes().filter(n => n.visitId === visitId);
    }
}
