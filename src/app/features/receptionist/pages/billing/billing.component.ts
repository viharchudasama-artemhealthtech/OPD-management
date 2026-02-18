import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { BillingService } from '../../services/billing.service';
import { BillingExportService } from '../../services/billing-export.service';
import { PatientService } from '../../../patient/services/patient.service';
import { Patient } from '../../../../core/models/patient.model';
import { OpdService } from '../../services/opd.service';
import { TokenStatus } from '../../../../core/models/enums/token-status.enum';
import { combineLatest, map } from 'rxjs';

interface PatientOption extends Patient {
    tokenNumber?: string;
}

@Component({
    selector: 'app-billing',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CardModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
        DropdownModule,
        TableModule,
        ToastModule,
        AvatarModule,
        DividerModule,
        TooltipModule
    ],
    providers: [MessageService],
    templateUrl: './billing.component.html',
    styleUrls: ['./billing.component.scss']
})
export class BillingComponent implements OnInit {
    billForm: FormGroup;
    patientId: string | null = null;
    patient: Patient | null = null;
    allPatients: PatientOption[] = [];
    today: Date = new Date();

    categoryOptions = [
        { label: 'Consultation', value: 'CONSULTATION' },
        { label: 'Procedure', value: 'PROCEDURE' },
        { label: 'Medicine', value: 'MEDICINE' },
        { label: 'Lab', value: 'LAB' },
        { label: 'Radiology', value: 'RADIOLOGY' },
        { label: 'Other', value: 'OTHER' }
    ];

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private billingService: BillingService,
        private billingExportService: BillingExportService,
        private patientService: PatientService,
        private opdService: OpdService,
        private messageService: MessageService
    ) {
        this.billForm = this.fb.group({
            items: this.fb.array([], Validators.required),
            discountAmount: [0, [Validators.required, Validators.min(0)]],
            taxAmount: [0, [Validators.required, Validators.min(0)]],
            subTotal: [{ value: 0, disabled: true }],
            totalAmount: [{ value: 0, disabled: true }]
        });
    }

    ngOnInit() {
        // Only show patients whose doctor consultation is COMPLETED today.
        // Billing can only be done after the doctor has finished the consultation.
        combineLatest([
            this.patientService.patients$,
            this.opdService.tokens$
        ]).pipe(
            map(([patients, tokens]) => {
                const today = new Date().toDateString();
                const completedTokens = tokens.filter(t =>
                    new Date(t.createdAt).toDateString() === today &&
                    t.status === TokenStatus.COMPLETED
                );
                const seen = new Set<string>();
                return completedTokens
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

        this.route.queryParamMap.subscribe(params => {
            const pid = params.get('patientId');
            if (pid) {
                this.selectPatient(pid);
            }
        });

        this.addItem(); // Add initial item row
        this.billForm.valueChanges.subscribe(() => this.calculateTotals());
    }

    selectPatient(patientId: string) {
        this.patientService.getPatientById(patientId).subscribe(p => {
            this.patient = p || null;
            if (!this.patient) {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Patient not found' });
            }
        });
    }

    get items() {
        return this.billForm.get('items') as FormArray;
    }

    addItem() {
        const itemForm = this.fb.group({
            description: ['', Validators.required],
            category: ['CONSULTATION', Validators.required],
            quantity: [1, [Validators.required, Validators.min(1)]],
            unitPrice: [0, [Validators.required, Validators.min(0)]],
            total: [{ value: 0, disabled: true }]
        });

        itemForm.valueChanges.subscribe(values => {
            const total = (values.quantity || 0) * (values.unitPrice || 0);
            itemForm.patchValue({ total }, { emitEvent: false });
        });

        this.items.push(itemForm);
    }

    removeItem(index: number) {
        this.items.removeAt(index);
    }

    calculateTotals() {
        const items = this.items.getRawValue();
        const subTotal = items.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
        const discount = this.billForm.get('discountAmount')?.value || 0;
        const tax = this.billForm.get('taxAmount')?.value || 0;
        const total = subTotal - discount + tax;

        this.billForm.patchValue({
            subTotal,
            totalAmount: Math.max(0, total)
        }, { emitEvent: false });
    }

    onSubmit() {
        if (this.billForm.valid && this.patient) {
            const formValue = this.billForm.getRawValue();
            const bill = this.billingService.createBill({
                patientId: this.patient.id,
                visitId: 'N/A', // TODO: link to actual visit
                date: new Date(),
                items: formValue.items,
                subTotal: formValue.subTotal,
                taxAmount: formValue.taxAmount,
                discountAmount: formValue.discountAmount,
                totalAmount: formValue.totalAmount,
                status: 'UNPAID'
            });

            this.billingExportService.generateInvoicePDF(bill, this.patient);
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Bill generated and Invoice downloaded' });
            setTimeout(() => this.router.navigate(['/receptionist/patients']), 1500);
        }
    }

    onCancel() {
        this.router.navigate(['/receptionist/patients']);
    }
}
