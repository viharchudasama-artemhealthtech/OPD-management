import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, of, throwError, combineLatest } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { Patient } from '../../../core/models/patient.model';
import { UserRole } from '../../../core/models/enums/user-role.enum';
import { NotificationService } from '../../../core/services/notification.service';
import { AppointmentService } from '../../receptionist/services/appointment.service';
import { DataSyncService } from '../../../core/services/data-sync.service';
import { ActivityService } from '../../../core/services/activity.service';

import { PatientRepository } from '../repositories/patient.repository';
import { UserService } from '../../admin/services/user.service';

@Injectable({
    providedIn: 'root',
})
export class PatientService implements OnDestroy {
    private readonly destroy$ = new Subject<void>();
    private readonly patientsSubject = new BehaviorSubject<Patient[]>([]);

    public readonly patients$ = this.patientsSubject.asObservable();

    constructor(
        private readonly notificationService: NotificationService,
        private readonly appointmentService: AppointmentService,
        private readonly dataSync: DataSyncService,
        private readonly activityService: ActivityService,
        private readonly patientRepository: PatientRepository,
        private readonly userService: UserService,
    ) {
        this.refreshPatients();

        this.dataSync
            .onKeyUpdate('patients')
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.refreshPatients());
    }

    private refreshPatients(): void {
        const patients = this.patientRepository.getPatients();
        this.patientsSubject.next(patients);
    }

    public registerPatient(patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Observable<Patient> {
        if (!patientData.fullName || !patientData.phone) {
            return throwError(() => new Error('Name and phone are required for registration.'));
        }

        const existingPatient = this.patientRepository.getPatientByPhone(patientData.phone);

        if (existingPatient) {
            return throwError(() => new Error(`A patient with this phone number already exists.`));
        }

        const newPatient: Patient = {
            ...patientData,
            id: `PAT-${crypto.randomUUID().substring(0, 8).toUpperCase()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const updatedList = [...this.patientsSubject.value, newPatient];
        this.patientRepository.savePatients(updatedList);
        this.patientsSubject.next(updatedList);

        this.activityService.logActivity(
            `Patient registered: ${newPatient.fullName}`,
            'pi pi-user-plus',
            'text-green-500',
            'success',
        );

        this.notificationService.showSuccess('Registration Successful', `${newPatient.fullName} (ID: ${newPatient.id})`);

        return of(newPatient);
    }

    public updatePatient(patient: Patient): Observable<Patient> {
        const patients = this.patientsSubject.value;
        const index = patients.findIndex(p => p.id === patient.id);

        if (index === -1) {
            return throwError(() => new Error('Patient record not found.'));
        }

        const updatedList = [...patients];
        updatedList[index] = { ...patient, updatedAt: new Date() };
        this.patientRepository.savePatients(updatedList);
        this.patientsSubject.next(updatedList);

        this.activityService.logActivity(
            `Patient profile updated: ${patient.fullName}`,
            'pi pi-user-edit',
            'text-orange-500',
            'info',
        );

        return of(updatedList[index]);
    }

    public deletePatient(patientId: string): Observable<void> {
        const patients = this.patientsSubject.value;
        const patient = patients.find(p => p.id === patientId);

        if (!patient) {
            return throwError(() => new Error('Patient not found.'));
        }

        const updatedList = patients.filter(p => p.id !== patientId);
        this.patientRepository.savePatients(updatedList);
        this.patientsSubject.next(updatedList);

        // Cascade delete appointments
        return this.appointmentService.deleteAppointmentsByPatient(patientId).pipe(
            tap(() => {
                this.notificationService.showInfo('Patient Removed', `${patient.fullName}'s records have been deleted.`);
            }),
            map(() => void 0),
        );
    }

    public getPatientById(id: string): Observable<Patient | undefined> {
        return combineLatest([this.patients$, this.userService.getUsers()]).pipe(
            map(([patients, users]) => {
                const patient = patients.find(p => p.id === id);
                if (patient) return patient;

                // Fallback: Check if it's a Portal User (Role: PATIENT)
                const user = users.find(u => u.id === id && u.role === UserRole.PATIENT);
                if (user) {
                    // Create a "Virtual Patient" from User data
                    return {
                        id: user.id,
                        fullName: user.fullName,
                        phone: user.phone || 'Portal User',
                        email: user.email,
                        gender: user.gender,
                        age: user.age,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt
                    } as Patient;
                }

                return undefined;
            })
        );
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
