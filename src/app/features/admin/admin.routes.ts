import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { UserRole } from '../../core/models/user.model';

export const adminRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMIN] },
  },
  {
    path: 'patients',
    loadComponent: () => import('./pages/patients/patients.component').then( m => m.PatientsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMIN] },
  },
  {
    path: 'users',
    loadComponent: () => import('./pages/users/users.component').then( m => m.UsersComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMIN] },
  },
];

