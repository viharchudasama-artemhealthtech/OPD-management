import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { Bill } from '../../../core/models/billing.model';
import { Patient } from '../../../core/models/patient.model';

@Injectable({
    providedIn: 'root',
})
export class BillingExportService {
    constructor() { }

    public generateInvoicePDF(bill: Bill, patient: Patient): void {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 20;

        // Header
        doc.setFontSize(22);
        doc.setTextColor(41, 128, 185);
        doc.text('MEDICAL CENTER', pageWidth / 2, y, { align: 'center' });
        y += 10;
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Patient Invoice / Cash Memo', pageWidth / 2, y, { align: 'center' });
        y += 5;
        doc.line(20, y, pageWidth - 20, y);
        y += 15;

        // Invoice Info
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text(`Invoice #: ${bill.billNumber}`, 20, y);
        doc.text(`Date: ${new Date(bill.date).toLocaleDateString()}`, pageWidth - 20, y, { align: 'right' });
        y += 7;
        doc.text(`Patient: ${patient.fullName} (ID: ${patient.id})`, 20, y);
        doc.text(`Status: ${bill.status}`, pageWidth - 20, y, { align: 'right' });
        y += 15;

        // Items Table Header
        doc.setFillColor(230, 230, 230);
        doc.rect(20, y, pageWidth - 40, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.text('Description', 25, y + 6);
        doc.text('Qty', 120, y + 6);
        doc.text('Price', 145, y + 6);
        doc.text('Amount', 170, y + 6);
        y += 15;

        // Items
        doc.setFont('helvetica', 'normal');
        bill.items.forEach(item => {
            doc.text(item.description, 25, y);
            doc.text(item.quantity.toString(), 122, y);
            doc.text(item.unitPrice.toFixed(2), 147, y);
            doc.text(item.total.toFixed(2), 172, y);
            y += 8;

            if (y > 250) {
                doc.addPage();
                y = 20;
            }
        });

        y += 5;
        doc.line(20, y, pageWidth - 20, y);
        y += 10;

        // Totals
        const rightAlignX = pageWidth - 20;
        doc.text('Subtotal:', 140, y);
        doc.text(bill.subTotal.toFixed(2), rightAlignX, y, { align: 'right' });
        y += 7;
        doc.text('Discount:', 140, y);
        doc.text(`- ${bill.discountAmount.toFixed(2)}`, rightAlignX, y, { align: 'right' });
        y += 7;
        doc.setFont('helvetica', 'bold');
        doc.text('Grand Total:', 140, y);
        doc.text(bill.totalAmount.toFixed(2), rightAlignX, y, { align: 'right' });

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text('This is a computer-generated invoice.', pageWidth / 2, 280, { align: 'center' });
        doc.text('Thank you for choosing our services.', pageWidth / 2, 285, { align: 'center' });

        doc.save(`Invoice_${bill.billNumber}.pdf`);
    }
}
