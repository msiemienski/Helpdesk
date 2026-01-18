import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/auth.model';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, CardModule, InputTextModule, PasswordModule, ButtonModule],
    templateUrl: './login.component.html'
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    private messageService = inject(MessageService);

    public loginForm: FormGroup;
    public loading = false;

    public constructor() {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    public onSubmit(): void {
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
        const credentials = this.loginForm.value as LoginRequest;

        this.authService.login(credentials).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Sukces', detail: 'Zalogowano pomyślnie' });
                void this.router.navigate(['/home']);
            },
            error: (err) => {
                this.loading = false;
                console.error('Login error', err);
            },
            complete: () => {
                this.loading = false;
            }
        });
    }
}
