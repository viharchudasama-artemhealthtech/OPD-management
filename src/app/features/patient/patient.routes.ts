import { Routes } from '@angular/router';

export const patientRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/patient-registration/patient-registration.component').then(
            (m => m.PatientRegistrationComponent),
          ),
      },
      {
        path: 'list',
        loadComponent: () =>
          import('./pages/patient-list/patient-list.component').then(m => m.PatientListComponent),
      },
      { path: '', redirectTo: 'register', pathMatch: 'full' },
    ],
  },
];
