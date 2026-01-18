import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService } from '../../../core/services/ticket.service';
import { AuthService } from '../../../core/services/auth.service';
import { Ticket } from '../../../core/models/ticket.model';
import { Observable, BehaviorSubject, combineLatest, map, shareReplay } from 'rxjs';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { PaginatorModule } from 'primeng/paginator';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FormsModule } from '@angular/forms';

interface SortEvent {
    field: string;
    order: number;
}

interface PageEvent {
    page?: number;
    first?: number;
    rows?: number;
    pageCount?: number;
}

@Component({
    selector: 'app-ticket-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        TagModule,
        ButtonModule,
        RouterLink,
        InputTextModule,
        SelectModule,
        CheckboxModule,
        PaginatorModule,
        IconFieldModule,
        InputIconModule
    ],
    templateUrl: './ticket-list.component.html'
})
export class TicketListComponent implements OnInit {
    private ticketService = inject(TicketService);
    private authService = inject(AuthService);

    // Categories mapping
    public categories: Map<number, string> = new Map<number, string>();

    // State Streams
    public search$ = new BehaviorSubject<string>('');
    public statusFilter$ = new BehaviorSubject<string | null>(null);
    public onlyMineFilter$ = new BehaviorSubject<boolean>(false);

    public sortField$ = new BehaviorSubject<string>('date');
    public sortOrder$ = new BehaviorSubject<number>(-1); // -1 = Desc, 1 = Asc

    public page$ = new BehaviorSubject<number>(0);
    public pageSize$ = new BehaviorSubject<number>(5);

    // UI Options
    public statusOptions = [
        { label: 'Wszystkie statusy', value: null },
        { label: 'Otwarte (OPEN)', value: 'OPEN' },
        { label: 'W toku (IN_PROGRESS)', value: 'IN_PROGRESS' },
        { label: 'Zamknięte (CLOSED)', value: 'CLOSED' }
    ];

    public sortOptions = [
        { label: 'Data: najnowsze', field: 'date', order: -1 },
        { label: 'Data: najstarsze', field: 'date', order: 1 },
        { label: 'Tytuł: A-Z', field: 'title', order: 1 },
        { label: 'Tytuł: Z-A', field: 'title', order: -1 },
        { label: 'Priorytet: najwyższy', field: 'priority', order: -1 },
        { label: 'Priorytet: najniższy', field: 'priority', order: 1 }
    ];

    public selectedSort = this.sortOptions[0];

    // Data Streams
    public filteredTickets$!: Observable<Ticket[]>;
    public totalRecords$!: Observable<number>;
    public paginatedTickets$!: Observable<Ticket[]>;

    private priorityWeight: Record<string, number> = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3 };

    public ngOnInit(): void {
        this.loadCategories();
        this.initializeStreams();
    }

    private loadCategories(): void {
        this.ticketService.getCategories().subscribe((cats) => {
            cats.forEach((c) => this.categories.set(c.id, c.name));
        });
    }

    private initializeStreams(): void {
        // Base tickets stream
        const baseTickets$ = this.ticketService.getTickets().pipe(shareReplay(1));
        const currentUser = this.authService.getUser();

        // 1. Filtering & Sorting
        this.filteredTickets$ = combineLatest([
            baseTickets$,
            this.search$,
            this.statusFilter$,
            this.onlyMineFilter$,
            this.sortField$,
            this.sortOrder$
        ]).pipe(
            map(([tickets, search, status, onlyMine, field, order]) => {
                let result = [...tickets];

                // Search filter (text)
                if (search.trim()) {
                    const term = search.toLowerCase();
                    result = result.filter((t) => t.title.toLowerCase().includes(term));
                }

                // Status filter (dropdown)
                if (status) {
                    result = result.filter((t) => t.status === status);
                }

                // "Only mine" filter (checkbox)
                if (onlyMine && currentUser) {
                    result = result.filter((t) => t.userId === currentUser.id);
                }

                // Sorting (3 types)
                result.sort((a, b) => {
                    let valA: unknown = a[field as keyof Ticket];
                    let valB: unknown = b[field as keyof Ticket];

                    // Priority sorting logic (numeric)
                    if (field === 'priority') {
                        valA = this.priorityWeight[valA as string] || 0;
                        valB = this.priorityWeight[valB as string] || 0;
                    }

                    // Alphabetical and Date sorting
                    const aVal = valA as string | number | Date;
                    const bVal = valB as string | number | Date;

                    if (aVal < bVal) return -1 * order;
                    if (aVal > bVal) return 1 * order;

                    return 0;
                });

                return result;
            }),
            shareReplay(1)
        );

        this.totalRecords$ = this.filteredTickets$.pipe(map((t) => t.length));

        // 2. Pagination
        this.paginatedTickets$ = combineLatest([
            this.filteredTickets$,
            this.page$,
            this.pageSize$
        ]).pipe(
            map(([tickets, page, size]) => {
                const start = page * size;

                return tickets.slice(start, start + size);
            })
        );
    }

    // Event Handlers
    public onSearch(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.search$.next(target.value);
        this.page$.next(0); // Reset to first page
    }

    public onStatusChange(value: string | null): void {
        this.statusFilter$.next(value);
        this.page$.next(0);
    }

    public onOnlyMineToggle(checked: boolean): void {
        this.onlyMineFilter$.next(checked);
        this.page$.next(0);
    }

    public onSortChange(option: SortEvent): void {
        this.sortField$.next(option.field);
        this.sortOrder$.next(option.order);
        this.page$.next(0);
    }

    public onPageChange(event: PageEvent): void {
        if (event.page !== undefined) {
            this.page$.next(event.page);
        }
        if (event.rows !== undefined) {
            this.pageSize$.next(event.rows);
        }
    }

    // Severity Helpers
    public getCategoryName(id: number): string {
        return this.categories.get(id) || 'Unknown';
    }

    public getSeverity(status: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
        switch (status) {
            case 'OPEN': return 'info';
            case 'IN_PROGRESS': return 'warn';
            case 'CLOSED': return 'success';
            default: return undefined;
        }
    }

    public getPrioritySeverity(priority: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
        switch (priority) {
            case 'HIGH': return 'danger';
            case 'MEDIUM': return 'warn';
            case 'LOW': return 'info';
            default: return undefined;
        }
    }
}
