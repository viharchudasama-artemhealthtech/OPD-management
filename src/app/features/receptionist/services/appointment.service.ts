import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Appointment } from '../../../core/models/appointment.model';
import { AppointmentStatus } from '../../../core/models/enums/appointment-status.enum';
import { NotificationService } from '../../../core/services/notification.service';
import { DataSyncService } from '../../../core/services/data-sync.service';
import { AppointmentRepository } from '../repositories/appointment.repository';

@Injectable({
    providedIn: 'root',
})
export class AppointmentService {
    private readonly appointmentsSubject = new BehaviorSubject<Appointment[]>([]);

    public readonly appointments$ = this.appointmentsSubject.asObservable();

    constructor(
        private readonly notificationService: NotificationService,
        private readonly dataSyncService: DataSyncService,
        private readonly appointmentRepository: AppointmentRepository,
    ) {
        this.refreshAppointments();

        // Reactive sync using DataSyncService
        this.dataSyncService.onKeyUpdate('appointments').subscribe(() => {
            this.refreshAppointments();
        });
    }

    private refreshAppointments(): void {
        const appointments = this.appointmentRepository.getAppointments();
        this.appointmentsSubject.next(appointments);
    }

    public bookAppointment(
        appointmentData: Omit<Appointment, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
    ): Observable<Appointment> {
        // Validation
        if (
            !appointmentData.patientId ||
            !appointmentData.doctorId ||
            !appointmentData.appointmentDate ||
            !appointmentData.timeSlot ||
            !appointmentData.department
        ) {
            return throwError(() => new Error('Missing required appointment fields'));
        }

        // Conflict check
        const hasConflict = this.checkConflict(
            appointmentData.doctorId,
            appointmentData.appointmentDate,
            appointmentData.timeSlot,
        );
        if (hasConflict) {
            const msg = `Doctor is unavailable at ${appointmentData.timeSlot}. Please choose another slot.`;
            this.notificationService.showWarning('Slot Unavailable', msg);
            return throwError(() => new Error(msg));
        }

        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomSuffix = Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, '0');

        const newAppointment: Appointment = {
            ...appointmentData,
            id: `APT-${dateStr}-${randomSuffix}`,
            status: AppointmentStatus.BOOKED,
            appointmentDate: new Date(appointmentData.appointmentDate),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const updated = [...this.appointmentsSubject.value, newAppointment];
        this.appointmentRepository.saveAppointments(updated);
        this.appointmentsSubject.next(updated);

        this.notificationService.showSuccess(
            'Appointment Confirmed',
            `ID: ${newAppointment.id} with ${newAppointment.doctorName}`,
        );

        return of(newAppointment);
    }

    private checkConflict(doctorId: string, date: string | Date, timeSlot: string): boolean {
        const dateStr = new Date(date).toISOString().split('T')[0];

        return this.appointmentsSubject.value.some(
            apt =>
                apt.doctorId === doctorId &&
                apt.status === AppointmentStatus.BOOKED &&
                new Date(apt.appointmentDate).toISOString().split('T')[0] === dateStr &&
                apt.timeSlot === timeSlot,
        );
    }

    public getAppointmentsByDoctor(doctorId: string): Observable<Appointment[]> {
        return this.appointments$.pipe(
            map(appts => appts.filter(apt => apt.doctorId === doctorId && apt.status === AppointmentStatus.BOOKED)),
        );
    }

    public updateAppointmentStatus(
        appointmentId: string,
        status: AppointmentStatus,
    ): Observable<Appointment | null> {
        const appointments = this.appointmentsSubject.value;
        const index = appointments.findIndex(apt => apt.id === appointmentId);

        if (index === -1) return of(null);

        const updatedApt = { ...appointments[index], status, updatedAt: new Date() };
        const updatedList = [...appointments];
        updatedList[index] = updatedApt;

        this.appointmentRepository.saveAppointments(updatedList);
        this.appointmentsSubject.next(updatedList);

        this.notificationService.showInfo('Status Updated', `Appointment ${appointmentId} is now ${status}`);
        return of(updatedApt);
    }

    public deleteAppointmentsByPatient(patientId: string): Observable<number> {
        const appointments = this.appointmentsSubject.value;
        const filtered = appointments.filter(apt => apt.patientId !== patientId);
        const count = appointments.length - filtered.length;

        if (count > 0) {
            this.appointmentRepository.saveAppointments(filtered);
            this.appointmentsSubject.next(filtered);
            this.notificationService.showInfo('Cleanup Done', `Removed ${count} appointments for deleted patient.`);
        }

        return of(count);
    }

    public searchAppointments(query: string): Observable<Appointment[]> {
        const term = query.toLowerCase().trim();
        return this.appointments$.pipe(
            map(appts =>
                appts.filter(
                    apt =>
                        (apt.status === AppointmentStatus.BOOKED || (apt.status as string) === 'SCHEDULED') &&
                        (apt.patientName.toLowerCase().includes(term) ||
                            (apt.patientPhone || '').includes(term) ||
                            apt.id.toLowerCase().includes(term)),
                ),
            ),
        );
    }

    public getMyAppointments(patientId: string): Observable<Appointment[]> {
        return of(this.appointmentRepository.getAppointmentsByPatient(patientId));
    }

    public cancelAppointment(appointmentId: string, reason?: string): Observable<Appointment | null> {
        return this.updateAppointmentStatus(appointmentId, AppointmentStatus.CANCELLED).pipe(
            map(apt => {
                if (apt && reason) {
                    this.notificationService.showInfo('Cancellation', `Reason: ${reason}`);
                }
                return apt;
            }),
        );
    }

    public getAvailableSlots(doctorId: string, date: Date): Observable<string[]> {
        const standardSlots = [
            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
            '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
        ];

        const dateStr = date.toISOString().split('T')[0];

        return this.appointments$.pipe(
            map(appts => {
                const booked = appts
                    .filter(
                        apt =>
                            apt.doctorId === doctorId &&
                            apt.status === AppointmentStatus.BOOKED &&
                            new Date(apt.appointmentDate).toISOString().split('T')[0] === dateStr,
                    )
                    .map(apt => apt.timeSlot);

                return standardSlots.filter(slot => !booked.includes(slot));
            }),
        );
    }
}
