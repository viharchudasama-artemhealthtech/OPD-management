import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { OpdService } from '../../../../core/services/opd.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule, TagModule, ButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  myAppointments$!: Observable<any[]>;
  myTokens$!: Observable<any[]>;
  currentUser: any;

  constructor(
    private appointmentService: AppointmentService,
    private opdService: OpdService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: any) => {
      this.currentUser = user;
      if (user) {
        this.myAppointments$ = this.appointmentService.appointments$.pipe(
          map((appointments: any) => appointments.filter((apt: any) => apt.patientId === user.id)),
        );
        this.myTokens$ = this.opdService.tokens$.pipe(
          map((tokens: any) => tokens.filter((token: any) => token.patientId === user.id)),
        );
      }
    });
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' {
    switch (status) {
      case 'SCHEDULED':
        return 'info';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      case 'PENDING':
        return 'warning';
      case 'IN_CONSULTATION':
        return 'info';
      default:
        return 'info';
    }
  }
}
