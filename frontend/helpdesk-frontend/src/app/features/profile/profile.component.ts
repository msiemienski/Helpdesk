import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, CardModule, InputTextModule, ButtonModule, MessageModule],
    templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private messageService = inject(MessageService);

    public profileForm: FormGroup;
    public user$ = this.authService.user$;
    public canAct$ = this.authService.canAct$;
    public loading = false;

    public constructor() {
        this.profileForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: [{ value: '', disabled: true }],
            role: [{ value: '', disabled: true }]
        });
    }

    public ngOnInit(): void {
        const user = this.authService.getUser();
        if (user) {
            this.profileForm.patchValue(user);
        }
    }

    public onSubmit(): void {
        if (this.profileForm.invalid) return;

        this.loading = true;

        this.authService.updateUser(this.profileForm.value).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Sukces', detail: 'Profil zaktualizowany' });
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }
}
