import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PatientService } from '../../../../core/services/patient.service';
import { Observable, tap } from 'rxjs';
import { Department } from '../../../../core/models/enums/department.enum';
import { Patient } from '../../../../core/models/patient.model';
import { User } from '../../../../core/models/user.model';
import { Appointment } from '../../../../core/models/appointment.model';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { AutoNextDirective } from '../../../../shared/directives/auto-next.directive';

export interface Doctor {
  id: string;
  fullName: string;
  department: Department;
}

@Component({
  selector: 'app-appointment-scheduling',
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
    ToastModule,
    AutoNextDirective
  ],
  providers: [MessageService],
  templateUrl: './appointment-scheduling.component.html',
  styleUrls: ['./appointment-scheduling.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentSchedulingComponent implements OnInit {
  private readonly errorHandler = inject(ErrorHandlerService);
  public readonly patients$: Observable<Patient[]>;
  public doctors: Doctor[] = [];
  public selectedPatient: Patient | null = null;
  public selectedDoctor: Doctor | null = null;
  public appointmentDate: Date | null = null;
  public selectedTimeSlot: string = '';
  public reason: string = '';

  public readonly timeSlots = [
    { label: '09:00 AM', value: '09:00' },
    { label: '09:30 AM', value: '09:30' },
    { label: '10:00 AM', value: '10:00' },
    { label: '10:30 AM', value: '10:30' },
    { label: '11:00 AM', value: '11:00' },
    { label: '11:30 AM', value: '11:30' },
    { label: '12:00 PM', value: '12:00' },
    { label: '02:00 PM', value: '14:00' },
    { label: '02:30 PM', value: '14:30' },
    { label: '03:00 PM', value: '15:00' },
    { label: '03:30 PM', value: '15:30' },
    { label: '04:00 PM', value: '16:00' },
    { label: '04:30 PM', value: '16:30' },
    { label: '05:00 PM', value: '17:00' },
  ];

  minDate = new Date();
  appointmentCode = '';
  isLoading = false;

  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly patientService: PatientService,
    private readonly authService: AuthService,
    private readonly messageService: MessageService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.patients$ = this.patientService.patients$;
  }

  ngOnInit(): void {
    this.loadDoctors();
  }

  private loadDoctors(): void {
    this.authService
      .getDoctors()
      .pipe(
        tap((doctors: User[]) => {
          const depts = [
            Department.GENERAL,
            Department.ENT,
            Department.CARDIOLOGY,
            Department.PEDIATRICS,
            Department.ORTHOPEDICS,
            Department.DENTAL,
          ];
          this.doctors = doctors.map((d: User, i: number) => ({
            id: d.id,
            fullName: d.fullName,
            department: d.department || depts[i % depts.length],
          }));
          this.cdr.markForCheck();
        }),
      )
      .subscribe();
  }

  public bookAppointment(): void {
    if (
      !this.selectedPatient ||
      !this.selectedDoctor ||
      !this.appointmentDate ||
      !this.selectedTimeSlot ||
      !this.reason
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields',
      });
      return;
    }

    this.isLoading = true;

    const appointment: Partial<Appointment> = {
      patientId: this.selectedPatient.id,
      patientName: this.selectedPatient.fullName,
      patientPhone: this.selectedPatient.phone,
      doctorId: this.selectedDoctor.id,
      doctorName: this.selectedDoctor.fullName,
      department: this.selectedDoctor.department,
      appointmentDate: this.appointmentDate,
      timeSlot: this.selectedTimeSlot,
      reason: this.reason,
    };

    this.appointmentService.bookAppointment(appointment as Appointment).subscribe({
      next: (result: Appointment) => {
        this.appointmentCode = result.id;
        this.messageService.add({
          severity: 'success',
          summary: 'Appointment Booked',
          detail: `Appointment ${result.id} scheduled successfully!`,
          life: 5000,
        });
        this.isLoading = false;
        this.cdr.markForCheck();
        // Don't reset form immediately so receptionist can see the code
        setTimeout(() => {
          this.resetForm();
          this.cdr.markForCheck();
        }, 3000);
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  resetForm(): void {
    this.selectedPatient = null;
    this.selectedDoctor = null;
    this.appointmentDate = null;
    this.selectedTimeSlot = '';
    this.reason = '';
    this.appointmentCode = '';
  }

  printAppointmentSlip(): void {
    if (this.appointmentCode) {
      window.print();
    }
  }
}
