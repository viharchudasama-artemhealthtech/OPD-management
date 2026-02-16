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
import { AppointmentService } from '../../services/appointment.service';
import { AppointmentStatus } from '../../../../core/models/enums/appointment-status.enum';
import { UserService } from '../../../admin/services/user.service';
import { UserRole } from '../../../../core/models/enums/user-role.enum';
import { combineLatest, map } from 'rxjs';

interface PatientOption extends Patient {
    appointmentCode?: string;
    hasAppointment?: boolean;
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
        private appointmentService: AppointmentService,
        private userService: UserService,
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
        combineLatest([
            this.patientService.patients$,
            this.appointmentService.appointments$,
            this.userService.users$
        ]).pipe(
            map(([patients, appointments, users]) => {
                const today = new Date().toDateString();

                // Get all registered patients
                const patientOptions: PatientOption[] = patients.map(p => {
                    const todayApt = appointments.find(a =>
                        a.patientId === p.id &&
                        new Date(a.appointmentDate).toDateString() === today &&
                        (a.status === AppointmentStatus.BOOKED || (a.status as any) === 'SCHEDULED')
                    );
                    return {
                        ...p,
                        appointmentCode: todayApt?.id,
                        hasAppointment: !!todayApt
                    };
                });

                // Add Portal Users (Role: PATIENT) who aren't registered yet
                const portalUsers = users.filter(u =>
                    u.role === UserRole.PATIENT &&
                    !patientOptions.some(p => p.id === u.id)
                ).map(u => ({
                    id: u.id,
                    fullName: u.fullName,
                    phone: u.phone || 'Portal User',
                    age: u.age,
                    gender: u.gender as any,
                    email: u.email,
                    createdAt: u.createdAt,
                    updatedAt: u.updatedAt,
                    hasAppointment: !!appointments.find(a =>
                        a.patientId === u.id &&
                        new Date(a.appointmentDate).toDateString() === today &&
                        (a.status === AppointmentStatus.BOOKED || (a.status as any) === 'SCHEDULED')
                    ),
                    appointmentCode: appointments.find(a =>
                        a.patientId === u.id &&
                        new Date(a.appointmentDate).toDateString() === today &&
                        (a.status === AppointmentStatus.BOOKED || (a.status as any) === 'SCHEDULED')
                    )?.id
                } as PatientOption));

                return [...patientOptions, ...portalUsers];
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
