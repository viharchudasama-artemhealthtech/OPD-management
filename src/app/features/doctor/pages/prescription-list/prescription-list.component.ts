import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PatientService } from '../../../patient/services/patient.service';
import { ClinicalService } from '../../services/clinical.service';
import { PrescriptionExportService } from '../../services/prescription-export.service';
import { Patient } from '../../../../core/models/patient.model';
import { VitalsService } from '../../../nursing/services/vitals.service';
import { UserService } from '../../../admin/services/user.service';
import { UserRole } from '../../../../core/models/enums/user-role.enum';
import { combineLatest, map, take } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-prescription-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, CardModule, TooltipModule],
  template: `
    <div class="p-4">
      <p-card header="E-Prescriptions" subheader="View and download patient prescriptions">
        <p-table [value]="enrichedPrescriptions" [rows]="10" [paginator]="true" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>Date</th>
              <th>Patient ID</th>
              <th>Patient Name</th>
              <th>Medicines</th>
              <th style="width: 100px">Action</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-p>
            <tr>
              <td>{{ p.date | date:'shortDate' }}</td>
              <td>{{ p.patientId }}</td>
              <td>{{ p.patientName }}</td>
              <td>
                <span *ngFor="let med of p.medicines; let last = last">
                  {{ med.medicineName }}{{ !last ? ', ' : '' }}
                </span>
              </td>
              <td>
                <button pButton icon="pi pi-download" class="p-button-rounded p-button-text" 
                  (click)="downloadPrescription(p)" pTooltip="Download PDF"></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="5" class="text-center p-4 text-600">No prescriptions found.</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `
})
export class PrescriptionListComponent implements OnInit {
  enrichedPrescriptions: any[] = [];

  constructor(
    private clinicalService: ClinicalService,
    private patientService: PatientService,
    private userService: UserService,
    private vitalsService: VitalsService,
    private exportService: PrescriptionExportService
  ) { }

  ngOnInit() {
    combineLatest([
      this.clinicalService.prescriptions$,
      this.patientService.patients$,
      this.userService.users$
    ]).pipe(
      map(([prescriptions, patients, users]) => {
        return prescriptions.map(p => {
          let patient = patients.find(pat => pat.id === p.patientId);

          // Fallback for Portal Users (like 'P1')
          if (!patient) {
            const user = users.find(u => u.id === p.patientId && u.role === UserRole.PATIENT);
            if (user) {
              patient = {
                id: user.id,
                fullName: user.fullName,
                phone: user.phone || 'Portal User',
                age: user.age,
                gender: user.gender as any,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
              } as any;
            }
          }

          return {
            ...p,
            patientName: patient ? patient.fullName : 'Unknown Patient',
            patientObj: patient
          };
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      })
    ).subscribe(enriched => {
      this.enrichedPrescriptions = enriched;
    });
  }

  downloadPrescription(p: any) {
    const patient = p.patientObj || ({
      id: p.patientId,
      fullName: 'Unknown Patient',
      phone: 'N/A',
      age: 0,
      gender: undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any);

    const vitals = this.vitalsService.getVitalsByPatient(p.patientId)
      .find(v => new Date(v.recordedAt).toDateString() === new Date(p.date).toDateString()) || null;

    const note = this.clinicalService.getNotesByVisit(p.visitId)[0] || null;

    this.exportService.generatePrescriptionPDF(p, patient as Patient, vitals, note);
  }
}
