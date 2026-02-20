import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TagModule } from 'primeng/tag';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AnalyticsService, StatCard, ChartData } from '../../../../core/services/analytics.service';
import { UserService } from '../../services/user.service';
import { ActivityService } from '../../../../core/services/activity.service';


interface DashboardData {
  stats: StatCard[];
  activities: any[];
  dailyVisits: ChartData;
  departmentDist: ChartData;
  workload: ChartData;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ChartModule, TableModule, ButtonModule, MenuModule, TagModule,],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  public readonly dashboardData$: Observable<DashboardData>;
  public today: Date = new Date();
  private router = inject(Router);

  public lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#334155', font: { family: 'Outfit', weight: '600' } },
      },
    },
    scales: {
      x: {
        ticks: { color: '#64748b', font: { family: 'Outfit' } },
        grid: { color: 'rgba(8,145,178,0.07)' },
      },
      y: {
        ticks: { color: '#64748b', font: { family: 'Outfit' } },
        grid: { color: 'rgba(8,145,178,0.07)' },
        beginAtZero: true,
      },
    },
  };

  public doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#334155',
          font: { family: 'Outfit', weight: '600' },
          padding: 14,
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
    },
  };

  public barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#334155', font: { family: 'Outfit', weight: '600' } },
      },
    },
    scales: {
      x: {
        ticks: { color: '#64748b', font: { family: 'Outfit' } },
        grid: { display: false },
      },
      y: {
        ticks: { color: '#64748b', font: { family: 'Outfit' } },
        grid: { color: 'rgba(8,145,178,0.07)' },
        beginAtZero: true,
      },
    },
  };

  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly userService: UserService,
    private readonly activityService: ActivityService,
  ) {
    this.dashboardData$ = combineLatest([
      this.analyticsService.getDashboardStats(),
      this.userService.users$,
      this.activityService.activities$,
      this.analyticsService.getDailyVisits(),
      this.analyticsService.getDepartmentDistribution(),
      this.analyticsService.getWorkloadStats(),
    ]).pipe(
      map(([stats, users, activities, dailyVisits, departmentDist, workload]: any[]) => ({
        stats,
        activities: activities.map((a: any) => ({
          ...a,
          timeLabel: this.formatTimeAgo(new Date(a.time)),
        })),
        dailyVisits,
        departmentDist,
        workload,
      })),
    );
  }

  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return date.toLocaleDateString();
  }

  navigateToUser() {
    this.router.navigate(['/admin/users']);
  }
}
