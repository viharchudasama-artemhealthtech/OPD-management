import { Injectable } from '@angular/core';
import { ClinicalNote, Prescription } from '../../../core/models/clinical.model';
import { DataSyncService } from '../../../core/services/data-sync.service';

@Injectable({
    providedIn: 'root',
})
export class ClinicalRepository {
    private readonly NOTES_KEY = 'clinical_notes';
    private readonly PRESCRIPTIONS_KEY = 'prescriptions';

    constructor(private readonly dataSync: DataSyncService) { }

    // Clinical Notes
    public getNotes(): ClinicalNote[] {
        return this.dataSync.getItem<ClinicalNote[]>(this.NOTES_KEY, []);
    }

    public saveNotes(notes: ClinicalNote[]): void {
        this.dataSync.setItem(this.NOTES_KEY, notes);
    }

    public getNotesByPatient(patientId: string): ClinicalNote[] {
        return this.getNotes().filter(n => n.patientId === patientId);
    }

    // Prescriptions
    public getPrescriptions(): Prescription[] {
        return this.dataSync.getItem<Prescription[]>(this.PRESCRIPTIONS_KEY, []);
    }

    public savePrescriptions(prescriptions: Prescription[]): void {
        this.dataSync.setItem(this.PRESCRIPTIONS_KEY, prescriptions);
    }

    public getPrescriptionsByPatient(patientId: string): Prescription[] {
        return this.getPrescriptions().filter(p => p.patientId === patientId);
    }

    public addPrescription(prescription: Prescription): void {
        const list = this.getPrescriptions();
        list.push(prescription);
        this.savePrescriptions(list);
    }

    public addNote(note: ClinicalNote): void {
        const list = this.getNotes();
        list.push(note);
        this.saveNotes(list);
    }
}
