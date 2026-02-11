import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { TabViewModule } from 'primeng/tabview';
import { InputSwitchModule } from 'primeng/inputswitch';

// RxJS
import { take, map } from 'rxjs/operators';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';

// Services
import { AppointmentService } from '../../../../core/services/appointment.service';
import { PatientService } from '../../../../core/services/patient.service';
import { OpdService } from '../../../../core/services/opd.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

// Models & Enums
import { Priority } from '../../../../core/models/enums/priority.enum';
import { Department } from '../../../../core/models/enums/department.enum';
import { VisitType } from '../../../../core/models/enums/visit-type.enum';
import { AppointmentStatus } from '../../../../core/models/enums/appointment-status.enum';
import { OpdToken } from '../../../../core/models/opd.model';
import { Patient } from '../../../../core/models/patient.model';
import { User } from '../../../../core/models/user.model';
import { Appointment } from '../../../../core/models/appointment.model';
import { AgePipe } from '../../../../shared/pipes/age.pipe';
import { PhonePipe } from '../../../../shared/pipes/phone.pipe';
import { GenderIconPipe } from '../../../../shared/pipes/gender-icon.pipe';

interface DropdownOption {
  label: string;
  value: string | Department | VisitType;
}

@Component({
  selector: 'app-opd-checkin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    DialogModule,
    TableModule,
    TagModule,
    TabViewModule,
    InputSwitchModule,
    AgePipe,
    PhonePipe,
    GenderIconPipe
  ],
  templateUrl: './opd-checkin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ["./opd-checkin.component.scss"],
})
export class OpdCheckinComponent implements OnInit {
  private readonly errorHandler = inject(ErrorHandlerService);
  public searchQuery: string = '';
  public searchResults$: Observable<Patient[]>;
  private readonly searchSubject = new BehaviorSubject<string>('');

  public selectedPatient: Patient | null = null;
  public readonly checkinForm: FormGroup;
  public departments: DropdownOption[] = [];

  public generatedToken: OpdToken | null = null;
  public displayTokenDialog: boolean = false;
  public doctors: DropdownOption[] = [];
  public isEmergency: boolean = false;

  // Appointment Check-in
  public appointmentSearchQuery: string = '';
  public appointmentSearchResults$: Observable<Appointment[]>;
  private readonly appointmentSearchSubject = new BehaviorSubject<string>('');
  public foundAppointment: Appointment | null = null;
  public isSearchingAppointment: boolean = false;

  constructor(
    private readonly patientService: PatientService,
    private readonly opdService: OpdService,
    private readonly authService: AuthService,
    private readonly appointmentService: AppointmentService,
    private readonly fb: FormBuilder,
    private readonly messageService: MessageService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.checkinForm = this.fb.group({
      department: [null, Validators.required],
      visitType: [VisitType.WALK_IN, Validators.required],
      doctorId: [null],
    });

    this.departments = Object.values(Department).map(d => ({ label: d, value: d }));

    this.searchResults$ = combineLatest([this.patientService.patients$, this.searchSubject]).pipe(
      map(([patients, query]) => {
        if (!query || query.length < 2) return [];
        const lowerQuery = query.toLowerCase();
        return patients.filter(
          (p: Patient) =>
            p.fullName.toLowerCase().includes(lowerQuery) ||
            p.phone.includes(lowerQuery) ||
            p.id.toLowerCase().includes(lowerQuery),
        );
      }),
    );

    this.appointmentSearchResults$ = combineLatest([
      this.appointmentService.appointments$,
      this.appointmentSearchSubject,
    ]).pipe(
      map(([appointments, query]) => {
        if (!query || query.length < 2) return [];
        const lowerQuery = query.toLowerCase();
        return appointments.filter(
          (a: Appointment) =>
            (a.status === AppointmentStatus.BOOKED || (a.status as any) === 'SCHEDULED') &&
            (a.patientName.toLowerCase().includes(lowerQuery) ||
              a.patientPhone?.includes(lowerQuery) ||
              a.id.toLowerCase().includes(lowerQuery)),
        );
      }),
    );
  }

  public ngOnInit(): void {
    this.loadDoctors();
  }

  private loadDoctors(): void {
    this.authService
      .getDoctors()
      .pipe(take(1))
      .subscribe((doctors: User[]) => {
        this.doctors = doctors.map((d: User) => ({ label: d.fullName, value: d.id }));
        this.cdr.markForCheck();
      });
  }

  public searchPatient(): void {
    this.searchSubject.next(this.searchQuery);
  }

  public selectPatient(patient: Patient): void {
    this.selectedPatient = patient;
    this.searchQuery = '';
    this.searchSubject.next('');
  }

  public clearSelection(): void {
    this.selectedPatient = null;
    this.isEmergency = false;
    this.checkinForm.reset({
      visitType: VisitType.WALK_IN,
    });
  }

  public onSubmit(): void {
    if (this.checkinForm.invalid || !this.selectedPatient) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all required fields.',
      });
      return;
    }

    const { department, doctorId } = this.checkinForm.value;
    const visitType = this.isEmergency ? VisitType.EMERGENCY : VisitType.WALK_IN;
    const priority = this.isEmergency ? Priority.HIGH : Priority.NORMAL;

    this.opdService
      .generateToken(this.selectedPatient.id, this.selectedPatient.fullName, department, visitType, doctorId, priority)
      .subscribe({
        next: (token: OpdToken) => {
          this.generatedToken = token;
          this.displayTokenDialog = true;
          this.messageService.add({
            severity: 'success',
            summary: 'Checked In',
            detail: 'Token Generated Successfully',
          });
          this.cdr.markForCheck();
        },
        error: (err: Error) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to generate token' });
          console.error('Check-in error:', err);
        },
      });
  }

  public closeDialog(): void {
    this.displayTokenDialog = false;
    this.clearSelection();
  }

  public goBack(): void {
    this.router.navigate(['/receptionist/dashboard']);
  }

  // Appointment Check-in Methods
  public searchAppointment(): void {
    this.appointmentSearchSubject.next(this.appointmentSearchQuery);
  }

  public selectAppointment(appointment: Appointment): void {
    this.foundAppointment = appointment;
    this.appointmentSearchQuery = '';
    this.appointmentSearchSubject.next('');
    this.messageService.add({
      severity: 'success',
      summary: 'Found',
      detail: `Appointment for ${appointment.patientName} with ${appointment.doctorName}`,
    });
  }

  public processAppointmentCheckin(): void {
    if (!this.foundAppointment) return;

    const department = Department.GENERAL;

    this.opdService.checkInAppointment(this.foundAppointment, department).subscribe({
      next: (token: OpdToken) => {
        this.generatedToken = token;
        this.displayTokenDialog = true;
        this.messageService.add({
          severity: 'success',
          summary: 'Checked In',
          detail: 'Appointment processed successfully',
        });

        // Update appointment status
        this.appointmentService.updateAppointmentStatus(this.foundAppointment!.id, AppointmentStatus.CHECKED_IN).subscribe();

        this.foundAppointment = null;
        this.appointmentSearchQuery = '';
        this.appointmentSearchSubject.next('');
        this.cdr.markForCheck();
      },
      error: () => {
        this.cdr.markForCheck();
      },
    });
  }
}
