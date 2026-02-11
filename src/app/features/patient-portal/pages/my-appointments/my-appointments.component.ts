import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, switchMap, shareReplay } from 'rxjs/operators';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Appointment } from '../../../../core/models/appointment.model';
import { User } from '../../../../core/models/user.model';
import { AppointmentStatus } from '../../../../core/models/enums/appointment-status.enum';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, TableModule, TagModule, ButtonModule, DropdownModule],
  templateUrl: './my-appointments.component.html',
  styleUrls: ['./my-appointments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyAppointmentsComponent implements OnInit {
  public myAppointments$!: Observable<Appointment[]>;
  public filteredAppointments$!: Observable<Appointment[]>;
  private readonly statusSubject = new BehaviorSubject<string>('ALL');
  public selectedStatus: string = 'ALL';

  public readonly statusOptions = [
    { label: 'All', value: 'ALL' },
    { label: 'Booked', value: 'BOOKED' },
    { label: 'Checked In', value: 'CHECKED_IN' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  public ngOnInit(): void {
    this.myAppointments$ = this.authService.currentUser$.pipe(
      switchMap((user: User | null) => {
        if (!user) return of([]);
        return this.appointmentService.getMyAppointments(user.id);
      }),
      shareReplay(1),
    );

    this.filteredAppointments$ = combineLatest([this.myAppointments$, this.statusSubject]).pipe(
      map(([appointments, status]) => {
        let filtered = [...appointments];
        if (status !== 'ALL') {
          filtered = filtered.filter((apt: Appointment) => apt.status === status);
        }
        return filtered.sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
      }),
    );
  }

  public filterAppointments(): void {
    this.statusSubject.next(this.selectedStatus);
  }

  viewDetails(appointmentId: string): void {
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
