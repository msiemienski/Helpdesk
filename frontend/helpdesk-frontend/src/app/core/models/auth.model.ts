import { User } from './user.model';
export type { User };

export interface LoginRequest {
    email: string;
    password?: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}
