export type TicketStatus = 'OPEN' | 'CLOSED' | 'IN_PROGRESS';

export interface Ticket {
    readonly id: number;
    readonly resourceId: number;
    readonly userId: number;
    readonly status: TicketStatus;
    readonly title: string;
    readonly description: string;
    readonly date: string;
}
