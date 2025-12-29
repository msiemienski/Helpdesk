import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TicketService } from '../../../core/services/ticket.service';
import { AuthService } from '../../../core/services/auth.service';
import { Ticket } from '../../../core/models/ticket.model';
import { Comment } from '../../../core/models/comment.model';
import { Category } from '../../../core/models/category.model';
import { Observable, switchMap, tap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { CardModule } from 'primeng/card';
import { TimelineModule } from 'primeng/timeline';
import { TagModule } from 'primeng/tag';

@Component({
    selector: 'app-ticket-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, TextareaModule, CardModule, TimelineModule, TagModule],
    templateUrl: './ticket-detail.component.html'
})
export class TicketDetailComponent implements OnInit {
    ticket: Ticket | null = null;
    comments$: Observable<Comment[]> | undefined;
    categories: Category[] = [];
    newCommentContent = '';
    ticketId: number = 0;

    constructor(
        private route: ActivatedRoute,
        private ticketService: TicketService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.ticketService.getCategories().subscribe((cats: Category[]) => this.categories = cats);

        this.route.paramMap.pipe(
            switchMap(params => {
                this.ticketId = Number(params.get('id'));
                this.comments$ = this.ticketService.getComments(this.ticketId);
                return this.ticketService.getTicket(this.ticketId);
            })
        ).subscribe(ticket => {
            this.ticket = ticket;
        });
    }

    getCategoryName(id: number): string {
        return this.categories.find(c => c.id === id)?.name || 'Unknown';
    }

    addComment() {
        if (!this.newCommentContent.trim()) return;

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
}
