import { Injectable } from '@angular/core';
import { Vitals } from '../../../core/models/vitals.model';
import { DataSyncService } from '../../../core/services/data-sync.service';

@Injectable({
    providedIn: 'root',
})
export class VitalsRepository {
    private readonly STORAGE_KEY = 'vitals';

    constructor(private readonly dataSync: DataSyncService) { }

    public getAllVitals(): Vitals[] {
        return this.dataSync.getItem<Vitals[]>(this.STORAGE_KEY, []);
    }

    public saveVitals(vitalsList: Vitals[]): void {
        this.dataSync.setItem(this.STORAGE_KEY, vitalsList);
    }

    public getVitalsByPatient(patientId: string): Vitals[] {
        return this.getAllVitals().filter((v) => v.patientId === patientId);
    }

    public getVitalsByAppointment(appointmentId: string): Vitals | undefined {
        return this.getAllVitals().find((v) => v.appointmentId === appointmentId);
    }

    public addVitals(vitals: Vitals): void {
        const list = this.getAllVitals();
        list.push(vitals);
        this.saveVitals(list);
    }
}
