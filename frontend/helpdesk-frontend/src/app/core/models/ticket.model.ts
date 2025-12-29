export type TicketStatus = 'OPEN' | 'CLOSED' | 'IN_PROGRESS';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Ticket {
    readonly id: number;
    readonly categoryId: number;
    readonly userId: number;
    readonly status: TicketStatus;
    readonly priority: TicketPriority;
    readonly title: string;
    readonly description: string;
    readonly date: string;
}
