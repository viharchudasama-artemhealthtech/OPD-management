import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { AnalyticsService, StatCard } from '../../../../core/services/analytics.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-receptionist-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, RouterLink, ButtonModule],
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
