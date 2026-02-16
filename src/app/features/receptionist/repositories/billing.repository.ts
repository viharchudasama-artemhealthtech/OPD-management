import { Injectable } from '@angular/core';
import { Bill, Payment } from '../../../core/models/billing.model';
import { DataSyncService } from '../../../core/services/data-sync.service';

@Injectable({
    providedIn: 'root',
})
export class BillingRepository {
    private readonly BILLS_KEY = 'bills';
    private readonly PAYMENTS_KEY = 'payments';

    constructor(private readonly dataSync: DataSyncService) { }

    public getBills(): Bill[] {
        return this.dataSync.getItem<Bill[]>(this.BILLS_KEY, []);
    }

    public saveBills(bills: Bill[]): void {
        this.dataSync.setItem(this.BILLS_KEY, bills);
    }

    public getPayments(): Payment[] {
        return this.dataSync.getItem<Payment[]>(this.PAYMENTS_KEY, []);
    }

    public savePayments(payments: Payment[]): void {
        this.dataSync.setItem(this.PAYMENTS_KEY, payments);
    }

    public addBill(bill: Bill): void {
        const bills = this.getBills();
        bills.push(bill);
        this.saveBills(bills);
    }

    public addPayment(payment: Payment): void {
        const payments = this.getPayments();
        payments.push(payment);
        this.savePayments(payments);
    }
}
