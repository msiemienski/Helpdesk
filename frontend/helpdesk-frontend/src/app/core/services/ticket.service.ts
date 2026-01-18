import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiClient } from './api-client.service';
import { Ticket } from '../models/ticket.model';
import { Comment } from '../models/comment.model';
import { Category } from '../models/category.model';
import { User } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class TicketService {
    private readonly api = inject(ApiClient);

    public getTickets(): Observable<Ticket[]> {
        return this.api.get<Ticket[]>('/tickets');
    }

    public getTicket(id: number): Observable<Ticket> {
        return this.api.get<Ticket>(`/tickets/${id}`);
    }

    public createTicket(ticket: Partial<Ticket>): Observable<Ticket> {
        return this.api.post<Ticket>('/tickets', ticket);
    }

    public updateTicket(id: number, ticket: Partial<Ticket>): Observable<Ticket> {
        return this.api.put<Ticket>(`/tickets/${id}`, ticket);
    }

    public deleteTicket(id: number): Observable<void> {
        return this.api.delete<void>(`/tickets/${id}`);
    }

    public getUser(id: number): Observable<User> {
        return this.api.get<User>(`/users/${id}`);
    }

    public getUsers(): Observable<User[]> {
        return this.api.get<User[]>('/users');
    }

    // Comments
    public getComments(ticketId: number): Observable<Comment[]> {
        const params = new HttpParams().set('ticketId', ticketId.toString());

        return this.api.get<Comment[]>('/comments', params);
    }

    public addComment(comment: Partial<Comment>): Observable<Comment> {
        return this.api.post<Comment>('/comments', comment);
    }

    // Categories
    public getCategories(): Observable<Category[]> {
        return this.api.get<Category[]>('/categories');
    }
}
