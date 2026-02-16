import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, of, throwError } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { OpdToken, Visit } from '../../../core/models/opd.model';
import { Department } from '../../../core/models/enums/department.enum';
import { TokenStatus } from '../../../core/models/enums/token-status.enum';
import { VisitType } from '../../../core/models/enums/visit-type.enum';
import { Priority } from '../../../core/models/enums/priority.enum';
import { Appointment } from '../../../core/models/appointment.model';
import { AppointmentStatus } from '../../../core/models/enums/appointment-status.enum';
import { DataSyncService } from '../../../core/services/data-sync.service';
import { ActivityService } from '../../../core/services/activity.service';
import { AppointmentService } from './appointment.service';
import { OpdRepository } from '../repositories/opd.repository';

@Injectable({
    providedIn: 'root',
})
export class OpdService implements OnDestroy {
    private readonly destroy$ = new Subject<void>();
    private readonly tokensSubject = new BehaviorSubject<OpdToken[]>([]);
    public readonly tokens$ = this.tokensSubject.asObservable();

    constructor(
        private readonly dataSync: DataSyncService,
        private readonly activityService: ActivityService,
        private readonly opdRepository: OpdRepository,
        private readonly appointmentService: AppointmentService,
    ) {
        this.refreshTokens();

        this.dataSync
            .onKeyUpdate('opd_tokens')
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.refreshTokens());
    }

    private refreshTokens(): void {
        const tokens = this.opdRepository.getTokens();
        this.tokensSubject.next(tokens);
    }

    public generateToken(
        patientId: string,
        patientName: string,
        department: Department,
        visitType: VisitType,
        doctorId: string | null = null,
        priority: Priority = Priority.NORMAL,
        appointmentId?: string,
    ): Observable<OpdToken> {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        const deptCode = department.substring(0, 3).toUpperCase();

        const todayTokens = this.tokensSubject.value.filter(
            t => t.department === department && new Date(t.createdAt).toDateString() === today.toDateString(),
        );

        const runningNumber = (todayTokens.length + 1).toString().padStart(3, '0');
        const tokenNumber = `${deptCode}-${dateStr}-${runningNumber}`;
        const pendingCount = todayTokens.filter(t => t.status === TokenStatus.CHECKED_IN).length;

        const newToken: OpdToken = {
            id: crypto.randomUUID(),
            tokenNumber,
            department,
            patientId,
            patientName,
            doctorId,
            visitType,
            status: TokenStatus.CHECKED_IN,
            priority: visitType === VisitType.EMERGENCY ? Priority.URGENT : (visitType === VisitType.APPOINTMENT ? Priority.HIGH : priority),
            appointmentId,
            queuePosition: pendingCount + 1,
            createdAt: today,
            updatedAt: today,
        };

        const updatedTokens = [...this.tokensSubject.value, newToken];
        this.opdRepository.saveTokens(updatedTokens);
        this.tokensSubject.next(updatedTokens);

        this.activityService.logActivity(
            `Token generated: ${tokenNumber} for ${patientName}`,
            'pi pi-ticket',
            'text-cyan-500',
            'info',
        );

        return of(newToken);
    }

    public getDepartmentQueue(department: Department): Observable<OpdToken[]> {
        return this.tokens$.pipe(map(tokens => this.processQueue(tokens.filter(t => t.department === department))));
    }

    public getAllQueues(): Observable<OpdToken[]> {
        return this.tokens$.pipe(map(tokens => this.processQueue(tokens)));
    }

    public getDoctorQueue(doctorId: string, department?: Department): Observable<OpdToken[]> {
        return this.tokens$.pipe(
            map(tokens =>
                this.processQueue(
                    tokens.filter(t => {
                        if (t.doctorId === doctorId) return true;
                        if (!t.doctorId && department) return t.department === department;
                        return false;
                    }),
                ),
            ),
        );
    }

    private processQueue(tokens: OpdToken[]): OpdToken[] {
        const sorted = tokens
            .filter(t => t.status === TokenStatus.CHECKED_IN || t.status === TokenStatus.IN_CONSULTATION)
            .sort((a, b) => {
                const priorityOrder = { [Priority.URGENT]: 0, [Priority.HIGH]: 1, [Priority.NORMAL]: 2 };
                if (a.priority !== b.priority) return priorityOrder[a.priority] - priorityOrder[b.priority];
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            });

        let pendingCounter = 0;
        return sorted.map(token => {
            if (token.status === TokenStatus.IN_CONSULTATION) {
                return {
                    ...token,
                    queuePosition: 0,
                };
            } else {
                pendingCounter++;
                return {
                    ...token,
                    queuePosition: pendingCounter,
                };
            }
        });
    }

    public getTokenById(tokenId: string): OpdToken | undefined {
        return this.tokensSubject.value.find(t => t.id === tokenId);
    }

    public updateTokenStatus(tokenId: string, status: TokenStatus, doctorId?: string): void {
        const tokens = this.tokensSubject.value;
        const index = tokens.findIndex(t => t.id === tokenId);

        if (index !== -1) {
            const updatedToken = {
                ...tokens[index],
                status,
                updatedAt: new Date(),
                doctorId: doctorId || tokens[index].doctorId,
            };

            if (status === TokenStatus.IN_CONSULTATION && !updatedToken.consultationStartedAt) {
                updatedToken.consultationStartedAt = new Date();
            }

            const updatedList = [...tokens];
            updatedList[index] = updatedToken;
            this.opdRepository.saveTokens(updatedList);
            this.tokensSubject.next(updatedList);
        }
    }

    public completeVisit(tokenId: string, diagnosis: string, notes: string): Observable<Visit> {
        const token = this.tokensSubject.value.find(t => t.id === tokenId);

        if (!token) return throwError(() => new Error('Registration record (token) not found.'));

        this.updateTokenStatus(tokenId, TokenStatus.COMPLETED);

        // Sync with Appointment if exists
        if (token.appointmentId) {
            import('../../../core/models/enums/appointment-status.enum').then(m => {
                this.appointmentService.updateAppointmentStatus(token.appointmentId!, m.AppointmentStatus.COMPLETED).subscribe();
            });
        }

        const visit: Visit = {
            id: crypto.randomUUID(),
            tokenNumber: token.tokenNumber,
            patientId: token.patientId,
            doctorId: token.doctorId || 'SYSTEM',
            department: token.department,
            date: new Date(),
            diagnosis,
            notes,
        };

        this.opdRepository.addVisit(visit);
        this.activityService.logActivity(
            `Consultation completed for ${token.patientName}`,
            'pi pi-check-circle',
            'text-green-500',
            'success',
        );

        return of(visit);
    }

    public hasCompletedVisitToday(patientId: string): Observable<boolean> {
        const today = new Date().toDateString();
        return this.tokens$.pipe(
            map(tokens => tokens.some(t =>
                t.patientId === patientId &&
                t.status === TokenStatus.COMPLETED &&
                new Date(t.createdAt).toDateString() === today
            ))
        );
    }

    public checkInAppointment(appointment: Appointment, department: Department): Observable<OpdToken> {
        const alreadyCheckedIn = this.tokensSubject.value.some(t => t.appointmentId === appointment.id);
        if (alreadyCheckedIn) {
            return throwError(() => new Error('Appointment has already been checked in.'));
        }

        return this.generateToken(
            appointment.patientId,
            appointment.patientName,
            department,
            VisitType.APPOINTMENT,
            appointment.doctorId,
            Priority.HIGH,
            appointment.id,
        );
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
