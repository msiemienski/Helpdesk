import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TicketService } from '../../../core/services/ticket.service';
import { AuthService } from '../../../core/services/auth.service';
import { Ticket, TicketStatus } from '../../../core/models/ticket.model';
import { Comment } from '../../../core/models/comment.model';
import { Category } from '../../../core/models/category.model';
import { Observable, switchMap, tap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { CardModule } from 'primeng/card';
import { TimelineModule } from 'primeng/timeline';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, RouterLink } from '@angular/router';

@Component({
    selector: 'app-ticket-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, TextareaModule, CardModule, TimelineModule, TagModule, MessageModule, RouterLink],
    templateUrl: './ticket-detail.component.html'
})
export class TicketDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private ticketService = inject(TicketService);
    private authService = inject(AuthService);
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);
    private router = inject(Router);

    ticket: Ticket | null = null;
    comments$: Observable<Comment[]> | undefined;
    categories: Category[] = [];
    newCommentContent = '';
    ticketId: number = 0;
    usersMap: Map<number, string> = new Map();

    canAct$ = this.authService.canAct$;
    user$ = this.authService.user$;

    constructor() { }

    ngOnInit() {
        this.ticketService.getCategories().subscribe((cats: Category[]) => this.categories = cats);
        this.ticketService.getUsers().subscribe(users => {
            users.forEach(u => this.usersMap.set(u.id, `${u.firstName} ${u.lastName}`));
        });

        this.loadTicket();
    }

    private loadTicket() {
        this.route.paramMap.pipe(
            switchMap(params => {
                this.ticketId = Number(params.get('id'));
                this.comments$ = this.ticketService.getComments(this.ticketId);
                return this.ticketService.getTicket(this.ticketId);
            }),
            tap(ticket => this.ticket = ticket)
        ).subscribe();
    }

    updateStatus(newStatus: TicketStatus) {
        if (!this.ticket) return;

        this.ticketService.updateTicket(this.ticketId, { ...this.ticket, status: newStatus }).subscribe({
            next: (updated) => {
                this.ticket = updated;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sukces',
                    detail: `Status zmieniony na ${newStatus}`
                });
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Błąd',
                    detail: 'Nie udało się zmienić statusu'
                });
            }
        });
    }

    deleteTicket() {
        this.confirmationService.confirm({
            message: 'Czy na pewno chcesz usunąć to zgłoszenie?',
            header: 'Potwierdzenie usunięcia',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Tak, usuń',
            rejectLabel: 'Anuluj',
            accept: () => {
                this.ticketService.deleteTicket(this.ticketId).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Sukces', detail: 'Zgłoszenie zostało usunięte' });
                        this.router.navigate(['/tickets']);
                    },
                    error: () => {
                        this.messageService.add({ severity: 'error', summary: 'Błąd', detail: 'Nie udało się usunąć zgłoszenia' });
                    }
                });
            }
        });
    }

    getCategoryName(id: number): string {
        return this.categories.find(c => c.id === id)?.name || 'Unknown';
    }

    getUserName(userId: number): string {
        return this.usersMap.get(userId) || `User #${userId}`;
    }

    addComment() {
        if (!this.newCommentContent.trim() || this.ticket?.status === 'CLOSED') return;

        const user = this.authService.getUser();
        if (!user) return;

        const comment: Partial<Comment> = {
            ticketId: this.ticketId,
            userId: user.id,
            content: this.newCommentContent,
            date: new Date().toISOString()
        };

        this.ticketService.addComment(comment).subscribe(() => {
            this.newCommentContent = '';
            this.comments$ = this.ticketService.getComments(this.ticketId); // Refresh comments
        });
    }

    getSeverity(status: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
        switch (status) {
            case 'OPEN': return 'info';
            case 'IN_PROGRESS': return 'warn';
            case 'CLOSED': return 'success';
            default: return undefined;
        }
    }

    getPrioritySeverity(priority: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
        switch (priority) {
            case 'HIGH': return 'danger';
            case 'MEDIUM': return 'warn';
            case 'LOW': return 'info';
            default: return undefined;
        }
    }
}
