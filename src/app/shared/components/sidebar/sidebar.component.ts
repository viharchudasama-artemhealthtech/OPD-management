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
  group?: 'Overview' | 'Clinical' | 'Operations' | 'Admin' | 'Patient Services';
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
      group: 'Overview'
    },
    {
      label: 'Patient Portal',
      icon: 'pi pi-id-card',
      route: '/patient-portal',
      roles: [UserRole.PATIENT],
      group: 'Patient Services'
    },
    {
      label: 'Book Appointment',
      icon: 'pi pi-calendar-plus',
      route: '/patient-portal/book',
      roles: [UserRole.PATIENT],
      group: 'Patient Services'
    },
    {
      label: 'My Appointments',
      icon: 'pi pi-history',
      route: '/patient-portal/appointments',
      roles: [UserRole.PATIENT],
      group: 'Patient Services'
    },
    {
      label: 'Medical Bills',
      icon: 'pi pi-wallet',
      route: '/patient-portal/bills',
      roles: [UserRole.PATIENT],
      group: 'Patient Services'
    },
    {
      label: 'My Prescriptions',
      icon: 'pi pi-file-pdf',
      route: '/patient-portal/prescriptions',
      roles: [UserRole.PATIENT],
      group: 'Patient Services'
    },
    {
      label: 'Patient Records',
      icon: 'pi pi-users',
      route: '/receptionist/patients',
      roles: [UserRole.RECEPTIONIST],
      group: 'Operations'
    },
    {
      label: 'OPD Check-in',
      icon: 'pi pi-check-circle',
      route: '/receptionist/checkin',
      roles: [UserRole.RECEPTIONIST],
      group: 'Operations'
    },
    {
      label: 'Patient Management',
      icon: 'pi pi-user-edit',
      route: '/patient',
      roles: [UserRole.ADMIN],
      group: 'Admin'
    },
    {
      label: 'OPD Queue',
      icon: 'pi pi-list',
      route: '/doctor/queue',
      roles: [UserRole.DOCTOR],
      group: 'Clinical'
    },
    {
      label: 'Admin Insights',
      icon: 'pi pi-chart-line',
      route: '/admin/dashboard',
      roles: [UserRole.ADMIN],
      group: 'Admin'
    },
    {
      label: 'Vitals Station',
      icon: 'pi pi-heart',
      route: '/receptionist/vitals',
      roles: [UserRole.RECEPTIONIST, UserRole.DOCTOR],
      group: 'Clinical'
    },
    {
      label: 'Billing & Invoices',
      icon: 'pi pi-receipt',
      route: '/receptionist/billing',
      roles: [UserRole.RECEPTIONIST, UserRole.ADMIN],
      group: 'Operations'
    },
    {
      label: 'E-Prescriptions',
      icon: 'pi pi-file-medical',
      route: '/receptionist/prescriptions',
      roles: [UserRole.RECEPTIONIST, UserRole.DOCTOR],
      group: 'Clinical'
    },
    {
      label: 'System Users',
      icon: 'pi pi-shield',
      route: '/admin/users',
      roles: [UserRole.ADMIN],
      group: 'Admin'
    },
  ];

  public get groups() {
    return ['Overview', 'Clinical', 'Operations', 'Admin', 'Patient Services'] as const;
  }

  public getItemsByGroup(group: string) {
    return this.filteredMenu.filter(item => item.group === group);
  }

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
