export type UserRole = 'admin' | 'user' | 'support';

export interface User {
    readonly id: number;
    readonly email: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly role: UserRole;
}
