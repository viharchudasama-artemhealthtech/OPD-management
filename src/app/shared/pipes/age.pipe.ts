import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'age',
    standalone: true
})
export class AgePipe implements PipeTransform {
    
    transform(value: Date | string | number | undefined | null): string {
        if (!value) return '';

        let birthDate: Date;
        if (value instanceof Date) {
            birthDate = value;
        } else if (typeof value === 'string') {
            birthDate = new Date(value);
        } else if (typeof value === 'number') {
            return `${value} years`;
        } else {
            return '';
        }

        if (isNaN(birthDate.getTime())) return '';

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age > 0 ? `${age} years` : 'Less than a year';
    }
}
