import { Injectable } from '@angular/core';
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
    constructor(private api: ApiClient) { }

    getTickets(): Observable<Ticket[]> {
        return this.api.get<Ticket[]>('/tickets');
    }

    getTicket(id: number): Observable<Ticket> {
        return this.api.get<Ticket>(`/tickets/${id}`);
    }

    createTicket(ticket: Partial<Ticket>): Observable<Ticket> {
        return this.api.post<Ticket>('/tickets', ticket);
    }

    updateTicket(id: number, ticket: Partial<Ticket>): Observable<Ticket> {
        return this.api.put<Ticket>(`/tickets/${id}`, ticket);
    }

    deleteTicket(id: number): Observable<void> {
        return this.api.delete<void>(`/tickets/${id}`);
    }

    getUser(id: number): Observable<User> {
        return this.api.get<User>(`/users/${id}`);
    }

    getUsers(): Observable<User[]> {
        return this.api.get<User[]>('/users');
    }

    // Comments
    getComments(ticketId: number): Observable<Comment[]> {
        const params = new HttpParams().set('ticketId', ticketId.toString());
        return this.api.get<Comment[]>('/comments', params);
    }

    addComment(comment: Partial<Comment>): Observable<Comment> {
        return this.api.post<Comment>('/comments', comment);
    }

    // Categories
    getCategories(): Observable<Category[]> {
        return this.api.get<Category[]>('/categories');
    }
}
