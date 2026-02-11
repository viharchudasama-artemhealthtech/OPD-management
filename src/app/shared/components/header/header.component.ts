import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService, Notification } from '../../../core/services/notification.service';
import { SystemSettingsService, SystemSettings } from '../../../core/services/system-settings.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, AvatarModule, MenuModule, BadgeModule, OverlayPanelModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @Output() readonly toggleSidebar = new EventEmitter<void>();

  public readonly currentUser$: Observable<User | null>;
  public readonly notifications$: Observable<Notification[]>;
  public readonly unreadCount$: Observable<number>;
  public readonly systemName$: Observable<string>;

  public readonly userMenuItems = [
    { label: 'Profile', icon: 'pi pi-user', command: () => this.router.navigate(['/profile']) },
    { separator: true },
    { label: 'Logout', icon: 'pi pi-sign-out', command: () => this.logout() },
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly notificationService: NotificationService,
    private readonly settingsService: SystemSettingsService,
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.notifications$ = this.notificationService.notifications$;
    this.unreadCount$ = this.notificationService.unreadCount$;
    this.systemName$ = this.settingsService.settings$.pipe(map((s: SystemSettings) => s.general.systemName));
  }

  public onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  public markAsRead(id: string): void {
    this.notificationService.markAsRead(id);
  }

  public clearAllNotifications(): void {
    this.notificationService.clearAll();
  }
}
