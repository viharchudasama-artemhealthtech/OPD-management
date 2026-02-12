import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../auth/services/auth.service';
import { AnalyticsService, ChartData, StatCard } from '../../core/services/analytics.service';
import { PatientService } from '../patient/services/patient.service';
import { AppointmentService } from '../receptionist/services/appointment.service';
import { User } from '../../core/models/user.model';
import { Appointment } from '../../core/models/appointment.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  // Consultant Dashboard View
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, ChartModule, SkeletonModule, ToastModule, TableModule, TagModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  public readonly currentUser$: Observable<User | null>;
  public readonly chartData$: Observable<ChartData>;
  public readonly demographicData$: Observable<ChartData>;
  public readonly workloadData$: Observable<ChartData>;
  public readonly insightStats$: Observable<StatCard[]>;
  public readonly recentAppointments$: Observable<Appointment[]>;

  public chartOptions: any;
  public demographicOptions: any;
  public workloadOptions: any;

  constructor(
    private readonly authService: AuthService,
    private readonly analyticsService: AnalyticsService,
    private readonly appointmentService: AppointmentService,
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.chartData$ = this.analyticsService.getDailyVisits();
    this.demographicData$ = this.analyticsService.getDepartmentDistribution();
    this.workloadData$ = this.analyticsService.getWorkloadStats();
    this.insightStats$ = this.analyticsService.getDashboardStats();

    this.recentAppointments$ = this.appointmentService.appointments$.pipe(
      map((appointments: Appointment[]) => {
        return [...appointments]
          .sort((a, b) => {
            const dateA = new Date(a.createdAt || a.appointmentDate).getTime();
            const dateB = new Date(b.createdAt || b.appointmentDate).getTime();
            return dateB - dateA;
          })
          .slice(0, 10);
      }),
    );
  }

  ngOnInit(): void {
    this.initChartOptions();
  }

  private initChartOptions(): void {
    this.chartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8' } },
      },
    };

    this.demographicOptions = {
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, color: '#64748b' } },
      },
      cutout: '60%',
    };

    this.workloadOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: { legend: { labels: { color: '#64748b' } } },
      scales: {
        x: { stacked: false, grid: { display: false }, ticks: { color: '#94a3b8' } },
        y: { stacked: false, grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8' } },
      },
    };
  }

  public getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' {
    switch (status) {
      case 'SCHEDULED':
        return 'info';
      case 'CHECKED_IN':
        return 'warning';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'warning';
    }
  }

  public getDemographicValue(index: number, demographics: ChartData): number {
    const dataset = demographics.datasets[0];
    if (!dataset || !dataset.data) return 0;
    return dataset.data[index] || 0;
  }

  public getDemographicColor(index: number, demographics: ChartData): string {
    const dataset = demographics.datasets[0];
    if (!dataset || !dataset.backgroundColor) return '#000';

    if (Array.isArray(dataset.backgroundColor)) {
      return dataset.backgroundColor[index] || '#000';
    }

    return dataset.backgroundColor;
  }
}
