import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Observable, EMPTY, of } from 'rxjs';
import { map, switchMap, shareReplay } from 'rxjs/operators';
import { AppointmentService } from '../../../receptionist/services/appointment.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Appointment } from '../../../../core/models/appointment.model';
import { User } from '../../../../core/models/user.model';
import { AppointmentStatus } from '../../../../core/models/enums/appointment-status.enum';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule, TableModule, TagModule],
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientDashboardComponent implements OnInit {
  public readonly currentUser$: Observable<User | null>;
  public myAppointments$!: Observable<Appointment[]>;
  public upcomingAppointment$!: Observable<Appointment | null>;

  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.currentUser$ = this.authService.currentUser$.pipe(shareReplay(1));
  }

  public ngOnInit(): void {
    this.myAppointments$ = this.currentUser$.pipe(
      switchMap((user: User | null) => {
        if (!user) return of([]);
        return this.appointmentService.getMyAppointments(user.id);
      }),
      shareReplay(1),
    );

    // Get next upcoming appointment
    this.upcomingAppointment$ = this.myAppointments$.pipe(
      map((appointments: Appointment[]) => {
        const upcoming = appointments
          .filter((apt: Appointment) => apt.status === 'BOOKED')
          .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
        return upcoming.length > 0 ? upcoming[0] : null;
      }),
    );

  }

  bookAppointment(): void {
    this.router.navigate(['/patient-portal/book']);
  }

  viewAllAppointments(): void {
    this.router.navigate(['/patient-portal/appointments']);
  }

  viewAppointmentDetails(appointmentId: string): void {
    this.router.navigate(['/patient-portal/appointments', appointmentId]);
  }

  cancelAppointment(appointmentId: string): void {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.appointmentService.cancelAppointment(appointmentId).subscribe();
    }
  }

  getStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' {
    switch (status) {
      case 'BOOKED':
        return 'info';
      case 'CHECKED_IN':
        return 'warning';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'secondary';
    }
  }
}
