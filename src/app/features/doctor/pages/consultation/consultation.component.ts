import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { ClinicalService } from '../../services/clinical.service';
import { VitalsService } from '../../../nursing/services/vitals.service';
import { PatientService } from '../../../patient/services/patient.service';
import { OpdService } from '../../../receptionist/services/opd.service';
import { AuthService } from '../../../auth/services/auth.service';
import { PrescriptionExportService } from '../../services/prescription-export.service';
import { Patient } from '../../../../core/models/patient.model';
import { Vitals } from '../../../../core/models/vitals.model';
import { Subject, takeUntil, map } from 'rxjs';

@Component({
    selector: 'app-consultation',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CardModule,
        ButtonModule,
        InputTextModule,
        InputTextareaModule,
        DropdownModule,
        TableModule,
        ToastModule,
        BadgeModule,
        AutoCompleteModule,
        DialogModule,
        InputNumberModule
    ],
    providers: [MessageService],
    templateUrl: './consultation.component.html',
    styleUrls: ['./consultation.component.scss']
})
export class ConsultationComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();
    consultationForm!: FormGroup;
    tokenId: string | null = null;
    patient: Patient | null = null;
    vitals: Vitals | null = null;
    isLoading: boolean = true;

    timingOptions = [
        { label: 'Before Food', value: 'BEFORE_FOOD' },
        { label: 'After Food', value: 'AFTER_FOOD' },
        { label: 'With Food', value: 'WITH_FOOD' },
        { label: 'Empty Stomach', value: 'EMPTY_STOMACH' }
    ];

    routeOptions = [
        { label: 'Oral', value: 'ORAL' },
        { label: 'Topical', value: 'TOPICAL' },
        { label: 'Inhalation', value: 'INHALATION' },
        { label: 'Injection', value: 'INJECTION' }
    ];

    icdSuggestions = [
        { label: 'A09.9 - Gastroenteritis', value: 'Gastroenteritis (A09.9)' },
        { label: 'J06.9 - Upper Respiratory Infection', value: 'URI (J06.9)' },
        { label: 'I10 - Essential Hypertension', value: 'Hypertension (I10)' },
        { label: 'E11.9 - Type 2 Diabetes', value: 'Type 2 Diabetes (E11.9)' },
        { label: 'M54.5 - Low Back Pain', value: 'Low Back Pain (M54.5)' },
    ];

    filteredIcdSuggestions: any[] = [];

    searchIcd(event: any) {
        this.filteredIcdSuggestions = this.icdSuggestions.filter(icd =>
            icd.label.toLowerCase().includes(event.query.toLowerCase())
        );
    }

    displayVitalsDialog: boolean = false;
    vitalsForm!: FormGroup;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private clinicalService: ClinicalService,
        private vitalsService: VitalsService,
        private patientService: PatientService,
        private opdService: OpdService,
        private authService: AuthService,
        private prescriptionExportService: PrescriptionExportService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {
        this.initForms();
    }

    private initForms() {
        this.consultationForm = this.fb.group({
            complaints: ['', Validators.required],
            history: [''],
            examination: [''],
            diagnosis: ['', Validators.required],
            plan: ['', Validators.required],
            medicines: this.fb.array([], Validators.required)
        });

        this.vitalsForm = this.fb.group({
            temperature: [null],
            pulse: [null],
            systolic: [null],
            diastolic: [null],
            spo2: [null],
            weight: [null],
            respiratoryRate: [null]
        });
    }

    openVitalsDialog() {
        if (this.vitals) {
            this.vitalsForm.patchValue({
                temperature: this.vitals.temperature,
                pulse: this.vitals.pulse,
                systolic: this.vitals.bloodPressure?.systolic,
                diastolic: this.vitals.bloodPressure?.diastolic,
                spo2: this.vitals.spo2,
                weight: this.vitals.weight,
                respiratoryRate: this.vitals.respiratoryRate
            });
        }
        this.displayVitalsDialog = true;
    }

    saveVitals() {
        if (!this.patient) return;
        const doctorId = this.authService.currentUserValue?.id || 'SYSTEM';
        const val = this.vitalsForm.value;
        const newVitals: Vitals = {
            id: crypto.randomUUID(),
            patientId: this.patient.id,
            recordedBy: doctorId,
            recordedAt: new Date(),
            temperature: val.temperature,
            pulse: val.pulse,
            bloodPressure: { systolic: val.systolic, diastolic: val.diastolic },
            spo2: val.spo2,
            weight: val.weight,
            respiratoryRate: val.respiratoryRate,
            bmi: val.weight ? Number((val.weight / 2.5).toFixed(1)) : 0, // Simplified BMI mock
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.vitalsService.recordVitals(newVitals);
        this.vitals = newVitals;
        this.displayVitalsDialog = false;
        this.messageService.add({ severity: 'success', summary: 'Vitals Synced', detail: 'Clinical vitals updated successfully' });
    }

    ngOnInit() {
        this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
            this.tokenId = params.get('tokenId');
            if (this.tokenId) {
                this.loadPatientAndToken();
            }
        });

        if (this.medicines.length === 0) {
            this.addMedicine();
        }
    }

    private loadPatientAndToken() {
        if (!this.tokenId) return;

        // Try getting patientId from query or token directly
        const patientIdFromQuery = this.route.snapshot.queryParamMap.get('patientId');

        this.opdService.tokens$.pipe(
            takeUntil(this.destroy$),
            map(tokens => tokens.find(t => t.id === this.tokenId))
        ).subscribe(token => {
            const patientId = patientIdFromQuery || token?.patientId;

            if (patientId && (!this.patient || this.patient.id !== patientId)) {
                this.loadPatientData(patientId);
            }
        });
    }

    private loadPatientData(patientId: string) {
        this.isLoading = true;
        this.patientService.getPatientById(patientId).pipe(takeUntil(this.destroy$)).subscribe(p => {
            if (p) {
                this.patient = p;
                // Reactive Vitals Lookup
                this.vitalsService.vitals$.pipe(
                    takeUntil(this.destroy$),
                    map(vList => vList.filter(v => v.patientId === p.id))
                ).subscribe(vFiltered => {
                    this.vitals = vFiltered.pop() || null;
                    this.cdr.markForCheck();
                    this.cdr.detectChanges();
                });
                this.isLoading = false;
            }
            this.cdr.markForCheck();
            this.cdr.detectChanges();
        });

        // Safety timeout to stop loading if not found
        setTimeout(() => {
            if (!this.patient) {
                this.isLoading = false;
                this.cdr.markForCheck();
            }
        }, 3000);
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    get medicines() {
        return this.consultationForm.get('medicines') as FormArray;
    }

    addMedicine() {
        const medicineForm = this.fb.group({
            medicineName: ['', Validators.required],
            dosage: ['', Validators.required],
            frequency: ['1-0-1', Validators.required],
            duration: ['5 days', Validators.required],
            timing: ['WITH_FOOD', Validators.required],
            route: ['ORAL', Validators.required],
            totalQuantity: [10, [Validators.required, Validators.min(1)]]
        });
        this.medicines.push(medicineForm);
        this.cdr.markForCheck();
    }

    removeMedicine(index: number) {
        this.medicines.removeAt(index);
        this.cdr.markForCheck();
    }

    onSubmit() {
        const doctorId = this.authService.currentUserValue?.id || 'SYSTEM';

        if (this.consultationForm.valid && this.tokenId && this.patient) {
            const formValue = this.consultationForm.value;
            const visitId = crypto.randomUUID();

            // Record Clinical Note
            this.clinicalService.recordClinicalNote({
                patientId: this.patient.id,
                doctorId: doctorId,
                visitId: visitId,
                date: new Date(),
                complaints: formValue.complaints.split(',').map((c: string) => c.trim()),
                history: formValue.history,
                examination: formValue.examination,
                diagnosis: formValue.diagnosis,
                plan: formValue.plan
            });

            // Record Prescription
            if (formValue.medicines.length > 0) {
                this.clinicalService.recordPrescription({
                    patientId: this.patient.id,
                    doctorId: doctorId,
                    visitId: visitId,
                    date: new Date(),
                    medicines: formValue.medicines,
                    instructions: formValue.plan
                });
            }

            // Complete OPD Token
            this.opdService.completeVisit(this.tokenId, formValue.diagnosis, formValue.plan).subscribe({
                next: () => {
                    // Generate PDF
                    if (formValue.medicines.length > 0) {
                        const prescription = {
                            patientId: this.patient!.id,
                            doctorId: doctorId,
                            visitId: visitId,
                            date: new Date(),
                            medicines: formValue.medicines,
                            instructions: formValue.plan
                        } as any;

                        const note = {
                            patientId: this.patient!.id,
                            doctorId: doctorId,
                            visitId: visitId,
                            date: new Date(),
                            complaints: formValue.complaints.split(',').map((c: string) => c.trim()),
                            diagnosis: formValue.diagnosis
                        } as any;

                        this.prescriptionExportService.generatePrescriptionPDF(prescription, this.patient!, this.vitals, note);
                    }

                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Consultation completed and Prescription generated' });
                    setTimeout(() => this.router.navigate(['/doctor/queue']), 1500);
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to complete consultation: ' + err.message });
                }
            });
        }
    }

    onCancel() {
        this.router.navigate(['/doctor/queue']);
    }
}
