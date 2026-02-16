import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AppointmentService } from '../../../receptionist/services/appointment.service';
import { AuthService } from '../../../auth/services/auth.service';
import { UserService } from '../../../admin/services/user.service';
import { PatientService } from '../../../patient/services/patient.service';
import { Observable, of } from 'rxjs';
import { map, take, switchMap } from 'rxjs/operators';
import { Department } from '../../../../core/models/enums/department.enum';
import { User } from '../../../../core/models/user.model';
import { Patient } from '../../../../core/models/patient.model';
import { Appointment } from '../../../../core/models/appointment.model';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { AutoNextDirective } from '../../../../shared/directives/auto-next.directive';

interface Doctor {
  id: string;
  fullName: string;
  department: Department;
}

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    CalendarModule,
    InputTextareaModule,
    ToastModule,
    AutoNextDirective
  ],
  providers: [MessageService],
  templateUrl: './book-appointment.component.html',
  styleUrls: ['./book-appointment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookAppointmentComponent implements OnInit {
  private readonly errorHandler = inject(ErrorHandlerService);
  public bookingForm: FormGroup;
  public doctors: Doctor[] = [];
  public availableSlots: { label: string; value: string }[] = [];
  public readonly minDate: Date = new Date();
  public readonly maxDate: Date;
  public currentUser: User | null = null;
  public isLoading: boolean = false;

  departments = [
    { label: 'Cardiology', value: Department.CARDIOLOGY },
    { label: 'ENT', value: Department.ENT },
    { label: 'Orthopedics', value: Department.ORTHOPEDICS },
    { label: 'Pediatrics', value: Department.PEDIATRICS },
    { label: 'General Medicine', value: Department.GENERAL },
    { label: 'Dental', value: Department.DENTAL },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly appointmentService: AppointmentService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly patientService: PatientService,
    private readonly messageService: MessageService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {
    // Set max date to 30 days from now
    this.maxDate = new Date();
    this.maxDate.setDate(this.maxDate.getDate() + 30);

    this.bookingForm = this.fb.group({
      department: ['', Validators.required],
      doctorId: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      timeSlot: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  public ngOnInit(): void {
    this.authService.currentUser$.pipe(take(1)).subscribe((user: User | null) => {
      this.currentUser = user;
      this.cdr.markForCheck();
    });

    // Load doctors (mock data for now)
    this.loadDoctors();

    // Watch for date changes to load available slots
    this.bookingForm.get('appointmentDate')?.valueChanges.subscribe(() => {
      this.loadAvailableSlots();
    });

    // Auto-select doctor when department changes
    this.bookingForm.get('department')?.valueChanges.subscribe(() => {
      const doctors = this.filteredDoctors;
      if (doctors.length > 0) {
        this.bookingForm.patchValue({ doctorId: doctors[0].id });
      } else {
        this.bookingForm.patchValue({ doctorId: null });
      }
      this.loadAvailableSlots();
    });

    this.bookingForm.get('doctorId')?.valueChanges.subscribe(() => {
      this.loadAvailableSlots();
    });
  }

  private loadDoctors(): void {
    this.userService.getDoctors().subscribe((doctors: User[]) => {
      this.doctors = doctors.map((d: User) => ({
        id: d.id,
        fullName: d.fullName,
        department: d.department || Department.GENERAL,
      }));
      this.cdr.markForCheck();
    });
  }

  get filteredDoctors(): Doctor[] {
    const selectedDept = this.bookingForm.get('department')?.value;
    if (!selectedDept) return [];
    return this.doctors.filter((d: any) => d.department === selectedDept);
  }

  public loadAvailableSlots(): void {
    const doctorId = this.bookingForm.get('doctorId')?.value;
    const date = this.bookingForm.get('appointmentDate')?.value;

    if (doctorId && date) {
      this.appointmentService
        .getAvailableSlots(doctorId, date)
        .pipe(take(1))
        .subscribe((slots: string[]) => {
          this.availableSlots = slots.map((slot: string) => ({ label: slot, value: slot }));
          this.cdr.markForCheck();
        });
    }
  }

  public bookAppointment(): void {
    if (!this.currentUser) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'User session not found' });
      return;
    }

    if (this.bookingForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Form',
        detail: 'Please fill all required fields',
      });
      return;
    }

    this.isLoading = true;
    const formValue = this.bookingForm.value;
    const selectedDoctor = this.doctors.find((d: Doctor) => d.id === formValue.doctorId);

    // Try to get patient details, fallback to current user if not found
    this.patientService
      .getPatientById(this.currentUser.id)
      .pipe(
        take(1),
        map(p => p || null),
        switchMap((patient: Patient | null) => {
          const patientName = patient?.fullName || this.currentUser!.fullName;
          const patientPhone = patient?.phone || '0000000000';

          const appointment: Partial<Appointment> = {
            patientId: this.currentUser!.id,
            patientName: patientName,
            patientPhone: patientPhone,
            doctorId: formValue.doctorId,
            doctorName: selectedDoctor?.fullName || '',
            department: formValue.department,
            appointmentDate: formValue.appointmentDate,
            timeSlot: formValue.timeSlot,
            reason: formValue.reason,
          };

          return this.appointmentService.bookAppointment(appointment as Appointment).pipe(take(1));
        }),
      )
      .subscribe({
        next: (booked: Appointment) => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Appointment Booked',
            detail: `Your appointment code is: ${booked.id}`,
          });
          this.cdr.markForCheck();
          setTimeout(() => {
            this.router.navigate(['/patient-portal']);
          }, 2000);
        },
        error: () => {
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  cancel(): void {
    this.router.navigate(['/patient-portal']);
  }
}
