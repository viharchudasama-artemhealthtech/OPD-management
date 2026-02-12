import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PatientService } from '../../../patient/services/patient.service';
import { Patient } from '../../../../core/models/patient.model';
import { AgePipe } from '../../../../shared/pipes/age.pipe';
import { PhonePipe } from '../../../../shared/pipes/phone.pipe';
import { GenderIconPipe } from '../../../../shared/pipes/gender-icon.pipe';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    RouterModule,
    AgePipe,
    PhonePipe,
    GenderIconPipe
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss'],
})
export class PatientListComponent implements OnInit {
  patients: Patient[] = [];
  selectedPatient: Patient | null = null;
  displayEditDialog: boolean = false;
  editForm: FormGroup;

  constructor(
    private patientService: PatientService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private fb: FormBuilder,
  ) {
    this.editForm = this.fb.group({
      fullName: ['', Validators.required],
      phone: ['', Validators.required],
      age: [null],
      gender: [''],
      address: [''],
    });
  }

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients() {
    this.patientService.patients$.subscribe((data: any) => {
      this.patients = data;
    });
  }

  editPatient(patient: Patient) {
    this.selectedPatient = { ...patient };
    this.editForm.patchValue(this.selectedPatient);
    this.displayEditDialog = true;
  }

  savePatient() {
    if (this.editForm.invalid || !this.selectedPatient) return;

    const updatedData = { ...this.selectedPatient, ...this.editForm.value };

    this.patientService.updatePatient(updatedData).subscribe({
      next: () => {
        this.displayEditDialog = false;
        this.selectedPatient = null;
      },
      error: () => {
        // Error handled in service
      },
    });
  }

  deletePatient(patient: Patient) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${patient.fullName}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.patientService.deletePatient(patient.id).subscribe();
      },
    });
  }
}
