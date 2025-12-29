import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService } from '../../../core/services/ticket.service';
import { Ticket } from '../../../core/models/ticket.model';
import { Category } from '../../../core/models/category.model';
import { Observable, forkJoin, map } from 'rxjs';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-ticket-list',
    standalone: true,
    imports: [CommonModule, TableModule, TagModule, ButtonModule, RouterLink],
    templateUrl: './ticket-list.component.html'
})
export class TicketListComponent implements OnInit {
    tickets$: Observable<Ticket[]> | undefined;
    categories: Map<number, string> = new Map();

    constructor(private ticketService: TicketService) { }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        const tickets$ = this.ticketService.getTickets();
        const categories$ = this.ticketService.getCategories();

        this.tickets$ = forkJoin({
            tickets: tickets$,
            categories: categories$
        }).pipe(
            map(({ tickets, categories }) => {
                categories.forEach(c => this.categories.set(c.id, c.name));
                return tickets;
            })
        );
    }

    getCategoryName(id: number): string {
        return this.categories.get(id) || 'Unknown';
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
