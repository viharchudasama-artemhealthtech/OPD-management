import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TagModule } from 'primeng/tag';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppointmentStatus } from '../../../../core/models/enums/appointment-status.enum';
import { TokenStatus } from '../../../../core/models/enums/token-status.enum';
import { AnalyticsService, StatCard } from '../../../../core/services/analytics.service';
import { UserService } from '../../services/user.service';
import { ActivityService, Activity } from '../../../../core/services/activity.service';

interface DashboardData {
  stats: StatCard[];
  activities: any[];
  systemStatus: any[];
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, ChartModule, TableModule, ButtonModule, MenuModule, TagModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  public readonly dashboardData$: Observable<DashboardData>;
  public today: Date = new Date();

  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly userService: UserService,
    private readonly activityService: ActivityService,
  ) {
    this.dashboardData$ = combineLatest([
      this.analyticsService.getDashboardStats(),
      this.userService.users$,
      this.activityService.activities$,
    ]).pipe(
      map(([stats, users, activities]: any[]) => {
        return {
          stats: stats,
          activities: activities.map((a: any) => ({
            ...a,
            timeLabel: this.formatTimeAgo(new Date(a.time)),
          })),
          systemStatus: this.getSystemStatus(),
        };
      }),
    );
  }

  private getSystemStatus() {
    const storageUsage = Math.round((JSON.stringify(localStorage).length / (5 * 1024 * 1024)) * 100);
    return [
      { name: 'Database Engine', status: 'Optimal', severity: 'success', icon: 'pi-database', value: '99.9% Uptime' },
      { name: 'Cloud Sync', status: 'Synchronized', severity: 'success', icon: 'pi-cloud-upload', value: 'Last: 2m ago' },
      { name: 'Security Shield', status: 'Protected', severity: 'success', icon: 'pi-shield', value: 'AES-256' },
      { name: 'System Memory', status: '42% Load', severity: 'info', icon: 'pi-server', value: '1.2GB/4GB' },
      {
        name: 'Storage Unit',
        status: `${storageUsage}% Used`,
        severity: storageUsage > 80 ? 'danger' : (storageUsage > 50 ? 'warning' : 'success'),
        icon: 'pi-hdd',
        value: `${(JSON.stringify(localStorage).length / 1024).toFixed(1)} KB`
      }
    ];
  }

  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return date.toLocaleDateString();
  }

  public getSeverityClass(status: string): string {
    if (status.includes('Healthy') || status.includes('Initialized') || status.includes('Active')) return 'success';
    if (status.includes('80%') || status.includes('90%')) return 'warning';
    return 'info';
  }
}
