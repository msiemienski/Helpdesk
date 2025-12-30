import { Injectable } from '@angular/core';
import { BehaviorSubject, map, tap } from 'rxjs';
import { LoginResponse, LoginRequest, User } from '../models/auth.model';
import { ApiClient } from './api-client.service';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private userSubject = new BehaviorSubject<User | null>(null);
    user$ = this.userSubject.asObservable();

    canAct$ = this.user$.pipe(
        map(user => !!user && !user.isSuspended)
    );

    private readonly TOKEN_KEY = 'auth_token';
    private readonly USER_KEY = 'auth_user';

    constructor(private api: ApiClient, private router: Router) {
        this.restoreSession();
    }

    login(credentials: LoginRequest) {
        return this.api.post<LoginResponse>('/auth/login', credentials).pipe(
            tap(response => {
                this.setSession(response);
            })
        );
    }

    logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.userSubject.next(null);
        this.router.navigate(['/auth/login']);
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    getUser(): User | null {
        return this.userSubject.value;
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    updateUser(userData: Partial<User>) {
        const current = this.getUser();
        if (!current) throw new Error('No user logged in');

        return this.api.put<User>(`/users/${current.id}`, { ...current, ...userData }).pipe(
            tap(updatedUser => {
                localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
                this.userSubject.next(updatedUser);
            })
        );
    }

    private setSession(authResult: LoginResponse) {
        localStorage.setItem(this.TOKEN_KEY, authResult.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(authResult.user));
        this.userSubject.next(authResult.user);
    }

    private restoreSession() {
        const token = this.getToken();
        const userJson = localStorage.getItem(this.USER_KEY);
        if (token && userJson) {
            this.userSubject.next(JSON.parse(userJson));
        }
    }
}
