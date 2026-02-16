import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ClinicalService } from '../../../doctor/services/clinical.service';
import { AuthService } from '../../../auth/services/auth.service';
import { PatientService } from '../../../patient/services/patient.service';
import { VitalsService } from '../../../nursing/services/vitals.service';
import { PrescriptionExportService } from '../../../doctor/services/prescription-export.service';
import { Prescription, ClinicalNote } from '../../../../core/models/clinical.model';
import { Patient } from '../../../../core/models/patient.model';
import { Vitals } from '../../../../core/models/vitals.model';
import { User } from '../../../../core/models/user.model';
import { take } from 'rxjs/operators';

@Component({
    selector: 'app-patient-prescriptions',
    standalone: true,
    imports: [CommonModule, CardModule, TableModule, ButtonModule, TooltipModule],
    templateUrl: './patient-prescriptions.component.html',
    styleUrls: ['./patient-prescriptions.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientPrescriptionsComponent implements OnInit {
    public prescriptions: Prescription[] = [];
    public isLoading = false;
    private patient: Patient | null = null;

    constructor(
        private readonly clinicalService: ClinicalService,
        private readonly authService: AuthService,
        private readonly patientService: PatientService,
        private readonly vitalsService: VitalsService,
        private readonly prescriptionExportService: PrescriptionExportService,
        private readonly cdr: ChangeDetectorRef
    ) { }

    public ngOnInit(): void {
        this.authService.currentUser$.pipe(take(1)).subscribe(user => {
            if (user) {
                this.loadPatientData(user.id);
                this.loadPrescriptions(user.id);
            }
        });
    }

    private loadPatientData(id: string): void {
        this.patientService.getPatientById(id).pipe(take(1)).subscribe(p => {
            this.patient = p || null;
            this.cdr.markForCheck();
        });
    }

    private loadPrescriptions(patientId: string): void {
        this.isLoading = true;
        this.prescriptions = this.clinicalService.getPatientPrescriptions(patientId);
        this.isLoading = false;
        this.cdr.markForCheck();
    }

    public downloadPrescription(prescription: Prescription): void {
        if (!this.patient) return;

        const visitId = prescription.visitId;

        // Find matching clinical note
        this.clinicalService.notes$.pipe(take(1)).subscribe(allNotes => {
            const note = allNotes.find(n => n.visitId === visitId) || null;

            // Find matching vitals
            this.vitalsService.vitals$.pipe(take(1)).subscribe(allVitals => {
                const vitals = allVitals.find(v => v.visitId === visitId || v.appointmentId === prescription.appointmentId) || null;
                this.prescriptionExportService.generatePrescriptionPDF(
                    prescription,
                    this.patient!,
                    vitals,
                    note
                );
            });
        });
    }
}
