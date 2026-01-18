import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

interface ErrorResponse {
    message?: string;
}

function getErrorMessage(error: HttpErrorResponse, req: HttpRequest<unknown>, authService: AuthService, router: Router): string {
    if (error.error instanceof ErrorEvent) {
        return `Błąd: ${error.error.message}`;
    }

    const serverError = error.error as ErrorResponse;
    const msg = serverError.message;

    if (error.status === 401) {
        if (req.url.includes('/auth/login')) return 'Błędny email lub hasło';
        authService.logout();

        return 'Sesja wygasła - zaloguj się ponownie';
    }

    if (error.status === 403) {
        void router.navigate(['/forbidden']);

        return 'Brak uprawnień';
    }

    if (error.status === 409) return msg || 'Konflikt danych';

    return msg || `Kod błędu: ${error.status}`;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const messageService = inject(MessageService);
    const router = inject(Router);
    const token = authService.getToken();

    const request = token ? req.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    }) : req;

    return next(request).pipe(
        catchError((error: HttpErrorResponse) => {
            const errorMessage = getErrorMessage(error, req, authService, router);

            messageService.add({
                severity: 'error',
                summary: 'Błąd',
                detail: errorMessage,
                life: 5000
            });

            return throwError(() => error);
        })
    );
};
