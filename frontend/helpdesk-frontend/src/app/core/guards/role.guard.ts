import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const user = authService.getUser();

    const expectedRole = route.data['role'] as UserRole;

    if (authService.isAuthenticated() && user && user.role === expectedRole) {
        return true;
    }

    if (authService.isAuthenticated()) {
        return router.createUrlTree(['/forbidden']);
    }


    return router.createUrlTree(['/auth/login']);
};
