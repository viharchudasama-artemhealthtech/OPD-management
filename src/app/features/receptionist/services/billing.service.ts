import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Bill, Payment, BillItem } from '../../../core/models/billing.model';
import { BillingRepository } from '../repositories/billing.repository';

@Injectable({
    providedIn: 'root',
})
export class BillingService {
    private readonly billsSubject = new BehaviorSubject<Bill[]>([]);
    public readonly bills$ = this.billsSubject.asObservable();

    constructor(private readonly billingRepository: BillingRepository) {
        this.refreshBills();
    }

    public refreshBills(): void {
        this.billsSubject.next(this.billingRepository.getBills());
    }

    public createBill(billData: Omit<Bill, 'id' | 'billNumber' | 'createdAt' | 'updatedAt'>): Bill {
        const newBill: Bill = {
            ...billData,
            id: crypto.randomUUID(),
            billNumber: `BILL-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.billingRepository.addBill(newBill);
        this.refreshBills();
        return newBill;
    }

    public recordPayment(paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Payment {
        const newPayment: Payment = {
            ...paymentData,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.billingRepository.addPayment(newPayment);

        // Update bill status
        this.updateBillStatus(newPayment.billId);

        return newPayment;
    }

    private updateBillStatus(billId: string): void {
        const bills = this.billingRepository.getBills();
        const bill = bills.find(b => b.id === billId);
        if (bill) {
            const payments = this.billingRepository.getPayments().filter(p => p.billId === billId);
            const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);

            if (paidAmount >= bill.totalAmount) {
                bill.status = 'PAID';
            } else if (paidAmount > 0) {
                bill.status = 'PARTIALLY_PAID';
            }

            this.billingRepository.saveBills(bills);
            this.refreshBills();
        }
    }

    public getBillsByPatient(patientId: string): Bill[] {
        return this.billingRepository.getBills().filter(b => b.patientId === patientId);
    }
}
