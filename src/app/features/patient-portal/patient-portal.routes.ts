import { Routes } from '@angular/router';
import { PatientDashboardComponent } from './pages/patient-dashboard/patient-dashboard.component';
import { BookAppointmentComponent } from './pages/book-appointment/book-appointment.component';
import { MyAppointmentsComponent } from './pages/my-appointments/my-appointments.component';
import { AppointmentDetailsComponent } from './pages/appointment-details/appointment-details.component';
import { PatientBillsComponent } from './pages/patient-bills/patient-bills.component';
import { PatientPrescriptionsComponent } from './pages/patient-prescriptions/patient-prescriptions.component';

export const patientPortalRoutes: Routes = [
  {
    path: '',
    component: PatientDashboardComponent,
  },
  {
    path: 'book',
    component: BookAppointmentComponent,
  },
  {
    path: 'appointments',
    component: MyAppointmentsComponent,
  },
  {
    path: 'appointments/:id',
    component: AppointmentDetailsComponent,
  },
  {
    path: 'records',
    redirectTo: '', // Records removed as per request
  },
  {
    path: 'bills',
    component: PatientBillsComponent,
  },
  {
    path: 'prescriptions',
    component: PatientPrescriptionsComponent,
  },
];
