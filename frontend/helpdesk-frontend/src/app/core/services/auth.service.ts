import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { LoginResponse, LoginRequest, User } from '../models/auth.model';
import { ApiClient } from './api-client.service';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly userSubject = new BehaviorSubject<User | null>(null);
    public readonly user$ = this.userSubject.asObservable();
    private readonly api = inject(ApiClient);
    private readonly router = inject(Router);

    public readonly canAct$ = this.user$.pipe(
        map((user) => !!user && !user.isSuspended)
    );

    private readonly TOKEN_KEY = 'auth_token';
    private readonly USER_KEY = 'auth_user';

    public constructor() {
        this.restoreSession();
    }

    public login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.api.post<LoginResponse>('/auth/login', credentials).pipe(
            tap((response) => {
                this.setSession(response);
            })
        );
    }

    public logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.userSubject.next(null);
        void this.router.navigate(['/auth/login']);
    }

    public getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    public getUser(): User | null {
        return this.userSubject.value;
    }

    public isAuthenticated(): boolean {
        return !!this.getToken();
    }

    public updateUser(userData: Partial<User>): Observable<User> {
        const current = this.getUser();
        if (!current) throw new Error('No user logged in');

        return this.api.put<User>(`/users/${current.id}`, { ...current, ...userData }).pipe(
            tap((updatedUser) => {
                localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
                this.userSubject.next(updatedUser);
            })
        );
    }

    private setSession(authResult: LoginResponse): void {
        localStorage.setItem(this.TOKEN_KEY, authResult.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(authResult.user));
        this.userSubject.next(authResult.user);
    }

    private restoreSession(): void {
        const token = this.getToken();
        const userJson = localStorage.getItem(this.USER_KEY);
        if (token && userJson) {
            try {
                const user = JSON.parse(userJson) as User;
                this.userSubject.next(user);
            } catch (e) {
                console.error('Error restoring session', e);
                this.logout();
            }
        }
    }
}
