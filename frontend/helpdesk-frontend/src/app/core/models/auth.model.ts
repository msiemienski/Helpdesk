import { User } from './user.model';
export type { User };

export interface LoginRequest {
    readonly email: string;
    readonly password?: string;
}

export interface LoginResponse {
    readonly token: string;
    readonly user: User;
}
