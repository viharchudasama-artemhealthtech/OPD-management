import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PatientService } from '../../../patient/services/patient.service';
import { Patient } from '../../../../core/models/patient.model';
import { AgePipe } from '../../../../shared/pipes/age.pipe';
import { PhonePipe } from '../../../../shared/pipes/phone.pipe';
import { GenderIconPipe } from '../../../../shared/pipes/gender-icon.pipe';
import { UserStatus } from '../../../../core/models/enums/user-status.enum';

@Component({
  selector: 'app-super-admin-patients',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    DialogModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    AgePipe,
    PhonePipe,
    GenderIconPipe
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.scss'],
})
export class PatientsComponent implements OnInit {
  patients: Patient[] = [];
  displayDialog: boolean = false;
  selectedPatient: Patient | null = null;
  searchValue: string = '';
  isLoading: boolean = false;

  cols = [
    { field: 'id', header: 'Patient ID' },
    { field: 'fullName', header: 'Full Name' },
    { field: 'phone', header: 'Phone' },
    { field: 'email', header: 'Email' },
    { field: 'gender', header: 'Gender' },
    { field: 'age', header: 'Age' },
    { field: 'bloodGroup', header: 'Blood Group' },
  ];

  constructor(
    private patientService: PatientService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnInit() {
    this.loadPatients();
    // Subscribe to service updates for real-time sync
    this.patientService.patients$.subscribe((patients: any) => {
      this.patients = patients;
    });
  }

  loadPatients() {
    this.patientService.patients$.subscribe((patients: any) => {
      this.patients = patients;
    });
  }

  viewPatient(patient: Patient) {
    this.selectedPatient = patient;
    this.displayDialog = true;
  }

  exportCSV() {
    this.messageService.add({
      severity: 'info',
      summary: 'Export',
      detail: 'Patient list exported to CSV',
    });
  }

  deletePatient(patient: Patient) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete patient ${patient.fullName}?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: `Patient ${patient.fullName} deleted successfully`,
        });
      },
    });
  }

  closeDialog() {
    this.displayDialog = false;
    this.selectedPatient = null;
  }

  getSeverity(status: string) {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'warning';
      default:
        return 'info';
    }
  }
}
