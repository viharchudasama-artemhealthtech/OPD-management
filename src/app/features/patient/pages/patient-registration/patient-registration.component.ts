import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PatientService } from '../../services/patient.service';
import { Router } from '@angular/router';
import { Patient } from '../../../../core/models/patient.model';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

import { DialogModule } from 'primeng/dialog';
import { KeyFilterModule } from 'primeng/keyfilter';
import { ChipsModule } from 'primeng/chips';
import { CheckboxModule } from 'primeng/checkbox';
import { GENDER_OPTIONS, BLOOD_GROUP_OPTIONS, RELATIONSHIP_OPTIONS } from '../../../../core/constants/patient.constants';
import { AutoNextDirective } from '../../../../shared/directives/auto-next.directive';
import { PhonePipe } from '../../../../shared/pipes/phone.pipe';

@Component({
  selector: 'app-patient-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    ButtonModule,
    CalendarModule,
    InputTextareaModule,
    ToastModule,
    DialogModule,
    KeyFilterModule,
    ChipsModule,
    CheckboxModule,
    AutoNextDirective,
    PhonePipe
  ],
  providers: [MessageService],
  templateUrl: './patient-registration.component.html',
  styleUrls: ['./patient-registration.component.scss'],
})
export class PatientRegistrationComponent implements OnInit {
  private readonly errorHandler = inject(ErrorHandlerService);

  registrationForm: FormGroup;
  genders = GENDER_OPTIONS;
  bloodGroups = BLOOD_GROUP_OPTIONS;
  relationships = RELATIONSHIP_OPTIONS;

  public displayQrDialog: boolean = false;
  public registeredPatient: Patient | null = null;
  maxDate: Date = new Date();
  isDuplicate: boolean = false;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,

    private messageService: MessageService,
    public router: Router,
  ) {
    this.registrationForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      dob: [null],
      age: [null, [Validators.required, Validators.min(0), Validators.max(120)]],
      gender: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
      occupation: [''],
      address: ['', Validators.required],
      bloodGroup: [''],
      allergies: [''],
      emergencyContact: this.fb.group({
        name: ['', Validators.required],
        phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        relationship: ['', Validators.required],
      }),
      medicalHistory: this.fb.array([]),
      consent: [false, Validators.requiredTrue],
    });
  }

  ngOnInit(): void {
    this.setupAgeCalculation();
    this.setupDuplicateCheck();
  }

  setupDuplicateCheck(): void {
    this.registrationForm.get('phone')?.valueChanges.subscribe((phone: string) => {
      if (phone && phone.length === 10) {
        this.patientService.patients$.subscribe(patients => {
          const existing = patients.find(p => p.phone === phone);
          this.isDuplicate = !!existing;
        });
      } else {
        this.isDuplicate = false;
      }
    });
  }

  setupAgeCalculation(): void {
    this.registrationForm.get('dob')?.valueChanges.subscribe((dob: Date) => {
      if (dob) {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        this.registrationForm.get('age')?.setValue(age);
      }
    });
  }


  get medicalHistory(): FormArray {
    return this.registrationForm.get('medicalHistory') as FormArray;
  }

  addHistory(): void {
    const historyForm = this.fb.group({
      condition: ['', Validators.required],
      diagnosedDate: [null, Validators.required],
      notes: [''],
    });
    this.medicalHistory.push(historyForm);
  }

  removeHistory(index: number): void {
    this.medicalHistory.removeAt(index);
  }

  public onSubmit(): void {
    if (this.registrationForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill all required fields correctly',
      });
      return;
    }

    this.patientService.registerPatient(this.registrationForm.value).subscribe({
      next: (patient: Patient) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Patient registered successfully',
        });

        this.registeredPatient = patient;
        this.displayQrDialog = true;
      },
      error: () => {
        // Error is handled by global interceptor
      },
    });
  }

  closeQrDialog(): void {
    this.displayQrDialog = false;
    this.router.navigate(['/patient/list']);
  }
}
