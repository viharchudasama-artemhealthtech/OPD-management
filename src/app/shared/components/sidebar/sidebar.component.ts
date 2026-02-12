import { Component, Input, OnInit, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserRole } from '../../../core/models/user.model';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../features/auth/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: UserRole[];
  separator?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, TooltipModule, ButtonModule, RippleModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit, OnChanges {

  @Input() public isCollapsed = false;
  @Input() public userRole: string | null = null;

  private readonly menuItems: MenuItem[] = [
    {
      label: 'Main Dashboard',
      icon: 'pi pi-th-large',
      route: '/dashboard',
      roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST],
    },
    {
      label: 'Patient Portal',
      icon: 'pi pi-id-card',
      route: '/patient-portal',
      roles: [UserRole.PATIENT],
    },
    {
      label: 'Book Appointment',
      icon: 'pi pi-calendar-plus',
      route: '/patient-portal/book',
      roles: [UserRole.PATIENT],
    },
    {
      label: 'My Appointments',
      icon: 'pi pi-history',
      route: '/patient-portal/appointments',
      roles: [UserRole.PATIENT],
    },
    {
      label: 'Patient Records',
      icon: 'pi pi-users',
      route: '/receptionist/patients',
      roles: [UserRole.RECEPTIONIST],
    },
    {
      label: 'OPD Check-in',
      icon: 'pi pi-check-circle',
      route: '/receptionist/checkin',
      roles: [UserRole.RECEPTIONIST],
    },
    {
      label: 'Patient Management',
      icon: 'pi pi-user-edit',
      route: '/patient',
      roles: [UserRole.ADMIN],
    },
    {
      label: 'OPD Queue',
      icon: 'pi pi-list',
      route: '/doctor/queue',
      roles: [UserRole.DOCTOR],
    },
    {
      label: 'Admin Insights',
      icon: 'pi pi-chart-line',
      route: '/admin/dashboard',
      roles: [UserRole.ADMIN],
    },
    {
      label: 'System Users',
      icon: 'pi pi-shield',
      route: '/admin/users',
      roles: [UserRole.ADMIN],
    },
  ];

  public filteredMenu: MenuItem[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) { }

  public ngOnInit(): void {
    this.filterMenu();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['userRole']) {
      this.filterMenu();
    }
  }

  private filterMenu(): void {
    if (!this.userRole) {
      this.filteredMenu = [];
      return;
    }
    this.filteredMenu = this.menuItems.filter((item: MenuItem) => item.roles.includes(this.userRole as UserRole));
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
