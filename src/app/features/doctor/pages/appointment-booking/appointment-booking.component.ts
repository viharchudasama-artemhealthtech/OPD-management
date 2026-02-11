import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessageModule } from 'primeng/message';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PatientService } from '../../../../core/services/patient.service';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Department } from '../../../../core/models/opd.model';
import { Patient } from '../../../../core/models/patient.model';
import { User } from '../../../../core/models/user.model';
import { Appointment } from '../../../../core/models/appointment.model';

@Component({
  selector: 'app-appointment-booking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    CalendarModule,
    DropdownModule,
    ButtonModule,
    InputTextareaModule,
    MessageModule,
  ],
  templateUrl: './appointment-booking.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentBookingComponent implements OnInit {
  public patients$!: Observable<Patient[]>;
  public currentDoctor: User | null = null;

  public selectedPatient: Patient | null = null;
  appointmentDate: Date | null = null;
  selectedTimeSlot: string = '';
  reason: string = '';

  timeSlots = [
    { label: '09:00 AM', value: '09:00' },
    { label: '09:30 AM', value: '09:30' },
    { label: '10:00 AM', value: '10:00' },
    { label: '10:30 AM', value: '10:30' },
    { label: '11:00 AM', value: '11:00' },
    { label: '11:30 AM', value: '11:30' },
    { label: '02:00 PM', value: '14:00' },
    { label: '02:30 PM', value: '14:30' },
    { label: '03:00 PM', value: '15:00' },
    { label: '03:30 PM', value: '15:30' },
    { label: '04:00 PM', value: '16:00' },
    { label: '04:30 PM', value: '16:30' },
  ];

  minDate = new Date();
  successMessage = '';
  errorMessage = '';
  appointmentCode = '';

  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly authService: AuthService,
    private readonly patientService: PatientService,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  public ngOnInit(): void {
    this.patients$ = this.patientService.patients$;
    this.authService.currentUser$.pipe(take(1)).subscribe((user: User | null) => {
      this.currentDoctor = user;
      this.cdr.markForCheck();
    });
  }

  public bookAppointment(): void {
    if (
      !this.selectedPatient ||
      !this.appointmentDate ||
      !this.selectedTimeSlot ||
      !this.reason ||
      !this.currentDoctor
    ) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    const appointment: Partial<Appointment> = {
      patientId: this.selectedPatient.id,
      patientName: this.selectedPatient.fullName,
      patientPhone: this.selectedPatient.phone,
      doctorId: this.currentDoctor.id,
      doctorName: this.currentDoctor.fullName,
      department: this.currentDoctor.department || Department.GENERAL,
      appointmentDate: this.appointmentDate,
      timeSlot: this.selectedTimeSlot,
      reason: this.reason,
    };

    this.appointmentService.bookAppointment(appointment as Appointment).subscribe({
      next: (result: Appointment) => {
        this.successMessage = `Appointment booked successfully! Code: ${result.id}`;
        this.appointmentCode = result.id;
        this.errorMessage = '';
        this.resetForm();
        this.cdr.markForCheck();
      },
      error: (err : Error ) => {
        this.errorMessage = err.message || 'Failed to book appointment';
        this.successMessage = '';
        this.cdr.markForCheck();
      },
    });
  }

  public resetForm(): void {
    this.selectedPatient = null;
    this.appointmentDate = null;
    this.selectedTimeSlot = '';
    this.reason = '';
  }
}
