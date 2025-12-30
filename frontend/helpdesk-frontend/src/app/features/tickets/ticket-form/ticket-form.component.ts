import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TicketService } from '../../../core/services/ticket.service';
import { AuthService } from '../../../core/services/auth.service';
import { Category } from '../../../core/models/category.model';
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

    ticketForm: FormGroup;
    categories: Category[] = [];
    isEditMode = false;
    ticketId: number | null = null;
    loading = false;

    priorities = [
        { label: 'Niski', value: 'LOW' },
        { label: 'Średni', value: 'MEDIUM' },
        { label: 'Wysoki', value: 'HIGH' }
    ];

    constructor() {
        this.ticketForm = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(5)]],
            description: ['', Validators.required],
            categoryId: [null, Validators.required],
            priority: ['LOW', Validators.required]
        });
    }

    ngOnInit() {
        this.loadCategories();
        this.checkEditMode();
    }

    loadCategories() {
        this.ticketService.getCategories().subscribe(cats => this.categories = cats);
    }

    checkEditMode() {
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
                    this.router.navigate(['/tickets']);
                }
            });
        }
    }

    onSubmit() {
        if (this.ticketForm.invalid) return;

        this.loading = true;
        const user = this.authService.getUser();

        const ticketData = {
            ...this.ticketForm.value,
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
                this.router.navigate(['/tickets', ticket.id]);
            },
            error: () => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Błąd', detail: 'Wystąpił błąd podczas zapisu' });
            }
        });
    }
}
