export interface Comment {
    readonly id: number;
    readonly ticketId: number;
    readonly userId: number;
    readonly content: string;
    readonly date: string;
}
