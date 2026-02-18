import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { VitalsService } from '../../services/vitals.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../../../patient/services/patient.service';
import { Patient } from '../../../../core/models/patient.model';
import { OpdService } from '../../../receptionist/services/opd.service';
import { TokenStatus } from '../../../../core/models/enums/token-status.enum';
import { combineLatest, map } from 'rxjs';

interface PatientOption extends Patient {
    tokenNumber?: string;
}

@Component({
    selector: 'app-vitals-entry',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CardModule,
        InputNumberModule,
        InputTextareaModule,
        ButtonModule,
        ToastModule,
        DropdownModule,
        TooltipModule,
        AvatarModule
    ],
    providers: [MessageService],
    templateUrl: './vitals-entry.component.html',
    styleUrls: ['./vitals-entry.component.scss']
})
export class VitalsEntryComponent implements OnInit {
    vitalsForm: FormGroup;
    patientId: string | null = null;
    patient: Patient | null = null;
    allPatients: PatientOption[] = [];

    constructor(
        private fb: FormBuilder,
        private vitalsService: VitalsService,
        private patientService: PatientService,
        private opdService: OpdService,
        private route: ActivatedRoute,
        private router: Router,
        private messageService: MessageService
    ) {
        this.vitalsForm = this.fb.group({
            temperature: [null, [Validators.required, Validators.min(90), Validators.max(110)]],
            pulse: [null, [Validators.required, Validators.min(30), Validators.max(250)]],
            systolic: [null, [Validators.required, Validators.min(50), Validators.max(300)]],
            diastolic: [null, [Validators.required, Validators.min(30), Validators.max(200)]],
            respiratoryRate: [null, [Validators.min(5), Validators.max(60)]],
            spo2: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
            weight: [null, [Validators.required, Validators.min(0)]],
            height: [null, [Validators.required, Validators.min(0)]],
            bmi: [null],
            notes: ['']
        });
    }

    ngOnInit() {
        // Only show patients who have checked in today (CHECKED_IN or IN_CONSULTATION).
        // Patients must go through OPD Check-in before vitals can be recorded.
        combineLatest([
            this.patientService.patients$,
            this.opdService.tokens$
        ]).pipe(
            map(([patients, tokens]) => {
                const today = new Date().toDateString();
                const activeTokens = tokens.filter(t =>
                    new Date(t.createdAt).toDateString() === today &&
                    (t.status === TokenStatus.CHECKED_IN || t.status === TokenStatus.IN_CONSULTATION)
                );
                const seen = new Set<string>();
                return activeTokens
                    .filter(t => {
                        if (seen.has(t.patientId)) return false;
                        seen.add(t.patientId);
                        return true;
                    })
                    .map(token => {
                        const patient = patients.find(p => p.id === token.patientId);
                        if (!patient) return null;
                        return { ...patient, tokenNumber: token.tokenNumber } as PatientOption;
                    })
                    .filter((p): p is PatientOption => p !== null);
            })
        ).subscribe(all => {
            this.allPatients = all;
        });

        this.route.paramMap.subscribe(params => {
            const pid = params.get('patientId');
            if (pid) {
                this.selectPatient(pid);
            }
        });

        // Auto calculate BMI
        this.vitalsForm.valueChanges.subscribe(values => {
            if (values.weight && values.height) {
                const bmi = this.vitalsService.calculateBMI(values.weight, values.height);
                if (bmi !== this.vitalsForm.get('bmi')?.value) {
                    this.vitalsForm.patchValue({ bmi }, { emitEvent: false });
                }
            }
        });
    }

    selectPatient(patientId: string) {
        this.patientId = patientId;
        this.patientService.getPatientById(patientId).subscribe(p => {
            this.patient = p || null;
            if (!this.patient) {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Patient not found' });
            }
        });
    }

    onSubmit() {
        if (this.vitalsForm.valid && this.patientId) {
            const formValue = this.vitalsForm.value;
            this.vitalsService.recordVitals({
                patientId: this.patientId,
                recordedBy: 'SYSTEM', // TODO: Get from AuthService
                recordedAt: new Date(),
                temperature: formValue.temperature,
                pulse: formValue.pulse,
                bloodPressure: {
                    systolic: formValue.systolic,
                    diastolic: formValue.diastolic
                },
                respiratoryRate: formValue.respiratoryRate,
                spo2: formValue.spo2,
                weight: formValue.weight,
                height: formValue.height,
                bmi: formValue.bmi,
                notes: formValue.notes
            });

            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Vitals recorded successfully' });
            setTimeout(() => this.onCancel(), 1500);
        }
    }

    onCancel() {
        this.router.navigate(['/receptionist/patients']);
    }
}
