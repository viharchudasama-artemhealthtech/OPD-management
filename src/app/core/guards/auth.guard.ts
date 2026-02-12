import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

/**
  Functional Auth Guard to protect routes from unauthorized access.
*/
export const authGuard: CanActivateFn = (route, state) => {

    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated) {
        return true;
    }

    router.navigate(
        ['/auth/login'],
        {
            queryParams: { returnUrl: state.url }
        });

    return false;
};

