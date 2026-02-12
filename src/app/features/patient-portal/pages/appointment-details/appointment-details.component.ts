import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AppointmentService } from '../../../receptionist/services/appointment.service';
import { Appointment } from '../../../../core/models/appointment.model';
import { AppointmentStatus } from '../../../../core/models/enums/appointment-status.enum';

@Component({
  selector: 'app-appointment-details',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule],
  templateUrl: './appointment-details.component.html',
  styleUrls: ['./appointment-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentDetailsComponent implements OnInit {
  public appointment$!: Observable<Appointment | undefined>;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly appointmentService: AppointmentService,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  public ngOnInit(): void {
    this.appointment$ = this.route.params.pipe(
      switchMap((params: Params) => {
        const appointmentId = params['id'];
        if (!appointmentId) return of(undefined);
        return this.appointmentService.appointments$.pipe(
          map((appointments: Appointment[]) => appointments.find((apt: Appointment) => apt.id === appointmentId)),
        );
      }),
    );
  }

  goBack(): void {
    this.router.navigate(['/patient-portal/appointments']);
  }

  cancelAppointment(appointmentId: string): void {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.appointmentService.cancelAppointment(appointmentId).subscribe(() => {
        this.router.navigate(['/patient-portal']);
      });
    }
  }

  getStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' {
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
        return 'secondary';
    }
  }
}
