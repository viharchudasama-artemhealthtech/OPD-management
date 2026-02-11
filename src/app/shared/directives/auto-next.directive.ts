import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
    selector: '[appAutoNext]',
    standalone: true
})
export class AutoNextDirective {
    
    constructor(private el: ElementRef) { }

    @HostListener('keydown.enter', ['$event'])
    onKeyDown(event: Event) {
        const keyboardEvent = event as KeyboardEvent;
        const target = keyboardEvent.target as HTMLElement;

        // Prevent default enter behavior (like form submission) if we want to move focus
        // However, if it's a textarea, we might want to allow new lines unless a modifier is pressed
        if (target.tagName.toLowerCase() === 'textarea' && !keyboardEvent.ctrlKey) {
            return;
        }

        keyboardEvent.preventDefault();

        const form = this.el.nativeElement.closest('form');
        if (!form) return;

        // Selectable elements
        const selectors = [
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'button:not([disabled])',
            '[tabindex]:not([disabled]):not([tabindex="-1"])',
            '.p-inputtext',
            '.p-dropdown',
            '.p-calendar input',
            '.p-inputnumber-input'
        ].join(',');

        const elements = Array.from(form.querySelectorAll(selectors)) as HTMLElement[];
        const currentIndex = elements.indexOf(target);

        if (currentIndex > -1 && currentIndex < elements.length - 1) {
            const nextElement = elements[currentIndex + 1];

            // Handle PrimeNG specific elements that might need internal input focus
            if (nextElement.tagName.toLowerCase().startsWith('p-')) {
                const innerInput = nextElement.querySelector('input, textarea, select') as HTMLElement;
                if (innerInput) {
                    innerInput.focus();
                } else {
                    nextElement.focus();
                }
            } else {
                nextElement.focus();
            }
        }
    }
}
