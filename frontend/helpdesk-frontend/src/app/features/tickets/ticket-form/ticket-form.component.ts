import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TicketService } from '../../../core/services/ticket.service';
import { AuthService } from '../../../core/services/auth.service';
import { Category } from '../../../core/models/category.model';
import { Ticket } from '../../../core/models/ticket.model';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { MessageModule } from 'primeng/message';

@Component({
    selector: 'app-ticket-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CardModule,
        InputTextModule,
        TextareaModule,
        SelectModule,
        ButtonModule,
        MessageModule,
        RouterLink
    ],
    templateUrl: './ticket-form.component.html'
})
export class TicketFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private ticketService = inject(TicketService);
    private authService = inject(AuthService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private messageService = inject(MessageService);

    public ticketForm: FormGroup;
    public categories: Category[] = [];
    public isEditMode = false;
    public ticketId: number | null = null;
    public loading = false;

    public priorities = [
        { label: 'Niski', value: 'LOW' },
        { label: 'Średni', value: 'MEDIUM' },
        { label: 'Wysoki', value: 'HIGH' }
    ];

    public constructor() {
        this.ticketForm = this.fb.group({
            title: ['', [(c: AbstractControl) => Validators.required(c), (c: AbstractControl) => Validators.minLength(5)(c)]],
            description: ['', (c: AbstractControl) => Validators.required(c)],
            categoryId: [null, (c: AbstractControl) => Validators.required(c)],
            priority: ['LOW', (c: AbstractControl) => Validators.required(c)]
        });
    }

    public ngOnInit(): void {
        this.loadCategories();
        this.checkEditMode();
    }

    public loadCategories(): void {
        this.ticketService.getCategories().subscribe((cats) => (this.categories = cats));
    }

    public checkEditMode(): void {
        this.ticketId = Number(this.route.snapshot.paramMap.get('id'));
        if (this.ticketId) {
            this.isEditMode = true;
            this.loading = true;
            this.ticketService.getTicket(this.ticketId).subscribe({
                next: (ticket) => {
                    this.ticketForm.patchValue(ticket);
                    this.loading = false;
                },
                error: () => {
                    this.messageService.add({ severity: 'error', summary: 'Błąd', detail: 'Nie udało się pobrać zgłoszenia' });
                    void this.router.navigate(['/tickets']);
                }
            });
        }
    }

    public onSubmit(): void {
        if (this.ticketForm.invalid) return;

        this.loading = true;
        const user = this.authService.getUser();

        const ticketData: Partial<Ticket> = {
            ...(this.ticketForm.value as Partial<Ticket>),
            userId: user?.id,
            date: this.isEditMode ? undefined : new Date().toISOString(),
            status: this.isEditMode ? undefined : 'OPEN'
        };

        const request$ = this.isEditMode
            ? this.ticketService.updateTicket(this.ticketId!, ticketData)
            : this.ticketService.createTicket(ticketData);

        request$.subscribe({
            next: (ticket) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sukces',
                    detail: this.isEditMode ? 'Zgłoszenie zaktualizowane' : 'Zgłoszenie utworzone'
                });
                void this.router.navigate(['/tickets', ticket.id]);
            },
            error: () => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Błąd', detail: 'Wystąpił błąd podczas zapisu' });
            }
        });
    }
}
