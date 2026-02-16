import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { BillingService } from '../../../receptionist/services/billing.service';
import { AuthService } from '../../../auth/services/auth.service';
import { BillingExportService } from '../../../receptionist/services/billing-export.service';
import { Bill } from '../../../../core/models/billing.model';
import { User } from '../../../../core/models/user.model';
import { take } from 'rxjs/operators';
import { PatientService } from '../../../patient/services/patient.service';
import { Patient } from '../../../../core/models/patient.model';

@Component({
    selector: 'app-patient-bills',
    standalone: true,
    imports: [CommonModule, CardModule, TableModule, ButtonModule, TagModule, TooltipModule],
    templateUrl: './patient-bills.component.html',
    styleUrls: ['./patient-bills.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientBillsComponent implements OnInit {
    public bills: Bill[] = [];
    public isLoading = false;
    private currentUser: User | null = null;
    private patient: Patient | null = null;

    constructor(
        private readonly billingService: BillingService,
        private readonly authService: AuthService,
        private readonly patientService: PatientService,
        private readonly billingExportService: BillingExportService,
        private readonly cdr: ChangeDetectorRef
    ) { }

    public ngOnInit(): void {
        this.authService.currentUser$.pipe(take(1)).subscribe(user => {
            this.currentUser = user;
            if (user) {
                this.loadPatientData(user.id);
                this.loadBills(user.id);
            }
        });
    }

    private loadPatientData(id: string): void {
        this.patientService.getPatientById(id).pipe(take(1)).subscribe(p => {
            this.patient = p || null;
            this.cdr.markForCheck();
        });
    }

    private loadBills(patientId: string): void {
        this.isLoading = true;
        this.bills = this.billingService.getBillsByPatient(patientId);
        this.isLoading = false;
        this.cdr.markForCheck();
    }

    public downloadInvoice(bill: Bill): void {
        if (this.patient) {
            this.billingExportService.generateInvoicePDF(bill, this.patient);
        }
    }

    public getStatusSeverity(status: string): 'success' | 'warning' | 'danger' | 'info' {
        switch (status) {
            case 'PAID': return 'success';
            case 'PARTIALLY_PAID': return 'warning';
            case 'UNPAID': return 'danger';
            default: return 'info';
        }
    }
}
