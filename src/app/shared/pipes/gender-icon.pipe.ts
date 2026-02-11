import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'genderIcon',
    standalone: true
})
export class GenderIconPipe implements PipeTransform {
    transform(value: string | undefined | null): string {
        if (!value) return 'pi pi-user';

        const gender = value.toLowerCase();

        switch (gender) {
            case 'male':
            case 'm':
                return 'pi pi-mars';
            case 'female':
            case 'f':
                return 'pi pi-venus';
            case 'other':
            case 'o':
                return 'pi pi-user';
            default:
                return 'pi pi-user';
        }
    }
}
