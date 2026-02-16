import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { AnalyticsService, StatCard } from '../../../../core/services/analytics.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  public readonly stats$: Observable<StatCard[]>;

  constructor(private readonly analyticsService: AnalyticsService) {
    this.stats$ = this.analyticsService.getDashboardStats();
  }
}
