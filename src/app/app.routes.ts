import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models/user.model';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { UnauthorizedComponent } from './shared/components/unauthorized/unauthorized.component';

export const routes: Routes = [
    
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes),
    },

    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full',
            },

            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
            },

            {
                path: 'patient',
                canActivate: [roleGuard],
                data: { roles: [UserRole.RECEPTIONIST] },
                loadChildren: () => import('./features/patient/patient.routes').then(m => m.patientRoutes),
            },

            {
                path: 'doctor',
                canActivate: [roleGuard],
                data: { roles: [UserRole.DOCTOR] },
                loadChildren: () => import('./features/doctor/doctor.routes').then(m => m.doctorRoutes),
            },

            {
                path: 'admin',
                canActivate: [roleGuard],
                data: { roles: [UserRole.ADMIN] },
                loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes),
            },

            {
                path: 'receptionist',
                canActivate: [roleGuard],
                data: { roles: [UserRole.RECEPTIONIST] },
                loadChildren: () => import('./features/receptionist/receptionist.routes').then(m => m.receptionistRoutes),
            },

            {
                path: 'patient-portal',
                canActivate: [roleGuard],
                data: { roles: [UserRole.PATIENT] },
                loadChildren: () => import('./features/patient-portal/patient-portal.routes').then(m => m.patientPortalRoutes),
            },

            {
                path: 'profile',
                loadComponent: () => import('./features/user/pages/profile/profile.component').then(m => m.ProfileComponent),
            },
        ],
    },

    {
        path: 'unauthorized',
        component: UnauthorizedComponent,
    },

    {
        path: '**',
        redirectTo: 'dashboard',
    },
];
