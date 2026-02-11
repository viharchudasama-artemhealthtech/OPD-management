import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'phone',
    standalone: true
})
export class PhonePipe implements PipeTransform {
    transform(value: string | number | undefined | null): string {
        if (!value) return '';

        const phone = value.toString().replace(/\D/g, '');

        if (phone.length === 10) {
            return `+91 ${phone.substring(0, 5)}-${phone.substring(5)}`;
        }

        return value.toString();
    }
}
