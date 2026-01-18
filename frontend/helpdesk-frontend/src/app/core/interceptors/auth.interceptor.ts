import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const messageService = inject(MessageService);
    const router = inject(Router);
    const token = authService.getToken();

    let request = req;

    if (token) {
        request = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(request).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage = 'Wystąpił nieoczekiwany błąd';
            let summary = 'Błąd';

            if (error.error instanceof ErrorEvent) {
                // Client-side error
                errorMessage = `Błąd: ${error.error.message}`;
            } else {
                // Server-side error
                if (error.status === 401) {
                    if (req.url.includes('/auth/login')) {
                        errorMessage = 'Błędny email lub hasło';
                    } else {
                        errorMessage = 'Sesja wygasła - zaloguj się ponownie';
                        authService.logout();
                    }
                } else if (error.status === 403) {
                    errorMessage = 'Brak uprawnień';
                    router.navigate(['/forbidden']);
                } else if (error.status === 409) {
                    errorMessage = error.error?.message || 'Konflikt danych';
                } else {
                    errorMessage = error.error?.message || `Kod błędu: ${error.status}`;
                }
            }

            messageService.add({
                severity: 'error',
                summary: summary,
                detail: errorMessage,
                life: 5000
            });

            return throwError(() => error);
        })
    );
};
