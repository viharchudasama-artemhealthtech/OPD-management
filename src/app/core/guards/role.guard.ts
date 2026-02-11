import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

/**
 * Functional Role Guard to restrict access based on user roles.
 */
export const roleGuard: CanActivateFn = (route, state) => {

    const authService = inject(AuthService);
    const router = inject(Router);

    const allowedRoles = route.data['roles'] as UserRole[];

    if (authService.isAuthenticated && authService.hasRole(allowedRoles)) {
        return true;
    }

    router.navigate(['/unauthorized']);
    return false;
};

