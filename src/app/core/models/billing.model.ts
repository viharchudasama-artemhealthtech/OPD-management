import { BaseEntity } from './base.model';

export interface Bill extends BaseEntity {
    billNumber: string;
    patientId: string;
    visitId: string;
    date: Date;

    items: BillItem[];
    subTotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;

    status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';
    paymentDetails?: Payment[];
}

export interface BillItem {
    description: string;
    category: 'CONSULTATION' | 'PROCEDURE' | 'MEDICINE' | 'LAB' | 'RADIOLOGY' | 'OTHER';
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface Payment extends BaseEntity {
    billId: string;
    amount: number;
    method: 'CASH' | 'CARD' | 'UPI' | 'INSURANCE' | 'OTHER';
    transactionId?: string;
    date: Date;
}
