import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { OpdService } from '../../../../core/services/opd.service';
import { AuthService } from '../../../../core/services/auth.service';
import { OpdToken } from '../../../../core/models/opd.model';
import { Department } from '../../../../core/models/enums/department.enum';
import { AppointmentStatus } from '../../../../core/models/enums/appointment-status.enum';
import { Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { Appointment } from '../../../../core/models/appointment.model';
import { User } from '../../../../core/models/user.model';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule, ButtonModule, TagModule, ToastModule],
  providers: [MessageService],
  templateUrl: './doctor-appointments.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorAppointmentsComponent implements OnInit {
  private readonly errorHandler = inject(ErrorHandlerService);
  public myAppointments$!: Observable<Appointment[]>;
  public currentDoctor: User | null = null;
  public isCheckingIn: Record<string, boolean> = {};

  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly opdService: OpdService,
    private readonly authService: AuthService,
    private readonly messageService: MessageService,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  public ngOnInit(): void {
    this.myAppointments$ = this.authService.currentUser$.pipe(
      switchMap((user: User | null) => {
        this.currentDoctor = user;
        if (!user) return of([]);

        return this.appointmentService.appointments$.pipe(
          map((appointments: Appointment[]) =>
            appointments
              .filter((apt: Appointment) => apt.doctorId === user.id)
              .sort((a: Appointment, b: Appointment) => {
                const dateA = new Date(a.appointmentDate).getTime();
                const dateB = new Date(b.appointmentDate).getTime();
                return dateA - dateB;
              }),
          ),
        );
      }),
    );
  }

  public checkInAppointment(appointment: Appointment): void {
    if (!this.currentDoctor) return;

    this.isCheckingIn[appointment.id] = true;

    const department = this.getDepartmentFromDoctor(this.currentDoctor);

    this.opdService.checkInAppointment(appointment, department).subscribe({
      next: (token: OpdToken) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Check-in Successful',
          detail: `Patient ${appointment.patientName} checked in with token ${token.tokenNumber}`,
          life: 5000,
        });

        this.appointmentService.updateAppointmentStatus(appointment.id, AppointmentStatus.CHECKED_IN).subscribe();

        this.isCheckingIn[appointment.id] = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isCheckingIn[appointment.id] = false;
        this.cdr.markForCheck();
      },
    });
  }

  private getDepartmentFromDoctor(doctor: User): Department {
    return doctor.department || Department.GENERAL;
  }

  public getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' {
    switch (status) {
      case AppointmentStatus.BOOKED:
        return 'info';
      case AppointmentStatus.CHECKED_IN:
        return 'warning';
      case AppointmentStatus.COMPLETED:
        return 'success';
      case AppointmentStatus.CANCELLED:
        return 'danger';
      default:
        return 'warning';
    }
  }

  public canCheckIn(appointment: Appointment): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const aptDate = new Date(appointment.appointmentDate);
    aptDate.setHours(0, 0, 0, 0);

    return appointment.status === AppointmentStatus.BOOKED && aptDate <= today;
  }

  public isFutureAppointment(appointment: Appointment): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const aptDate = new Date(appointment.appointmentDate);
    aptDate.setHours(0, 0, 0, 0);

    return aptDate > today;
  }
}
