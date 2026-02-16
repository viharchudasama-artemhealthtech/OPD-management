import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Vitals } from '../../../core/models/vitals.model';
import { VitalsRepository } from '../repositories/vitals.repository';

@Injectable({
    providedIn: 'root',
})
export class VitalsService {
    private readonly vitalsSubject = new BehaviorSubject<Vitals[]>([]);
    public readonly vitals$ = this.vitalsSubject.asObservable();

    constructor(private readonly vitalsRepository: VitalsRepository) {
        this.refreshVitals();
    }

    public refreshVitals(): void {
        this.vitalsSubject.next(this.vitalsRepository.getAllVitals());
    }

    public getVitalsByPatient(patientId: string): Vitals[] {
        return this.vitalsRepository.getVitalsByPatient(patientId);
    }

    public getVitalsByAppointment(appointmentId: string): Vitals | undefined {
        return this.vitalsRepository.getVitalsByAppointment(appointmentId);
    }

    public recordVitals(vitals: Omit<Vitals, 'id' | 'createdAt' | 'updatedAt'>): void {
        const newVitals: Vitals = {
            ...vitals,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.vitalsRepository.addVitals(newVitals);
        this.refreshVitals();
    }

    public calculateBMI(weightKg: number, heightCm: number): number | undefined {
        if (!weightKg || !heightCm) return undefined;
        const heightM = heightCm / 100;
        return parseFloat((weightKg / (heightM * heightM)).toFixed(2));
    }
}
