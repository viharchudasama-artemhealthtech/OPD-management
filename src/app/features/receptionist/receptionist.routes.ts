import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';
import { UserRole } from '../../core/models/user.model';
import { authGuard } from '../../core/guards/auth.guard';

export const receptionistRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.RECEPTIONIST] },
  },
  {
    path: 'checkin',
    loadComponent: () => import('./pages/opd-checkin/opd-checkin.component').then(m => m.OpdCheckinComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.RECEPTIONIST] },
  },
  {
    path: 'patients',
    loadComponent: () => import('./pages/patient-list/patient-list.component').then(m  => m.PatientListComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.RECEPTIONIST] },
  },
  {
    path: 'appointments',
    loadComponent: () =>
      import('./pages/appointment-scheduling/appointment-scheduling.component').then(
        m => m.AppointmentSchedulingComponent,
      ),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.RECEPTIONIST] },
  },
];
