import { Routes } from '@angular/router';

export const doctorRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'queue',
        loadComponent: () =>
          import('./pages/doctor-queue/doctor-queue.component').then(m => m.DoctorQueueComponent),
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./pages/doctor-appointments/doctor-appointments.component').then(m => m.DoctorAppointmentsComponent),
      },
      {
        path: 'appointment',
        loadComponent: () =>
          import('./pages/appointment-booking/appointment-booking.component').then(m => m.AppointmentBookingComponent),
      },
      {
        path: 'consultation/:tokenId',
        loadComponent: () =>
          import('./pages/consultation/consultation.component').then(m => m.ConsultationComponent),
      },
      {
        path: 'prescriptions',
        loadComponent: () => import('./pages/prescription-list/prescription-list.component').then(m => m.PrescriptionListComponent),
      },
    ],
  },
];
