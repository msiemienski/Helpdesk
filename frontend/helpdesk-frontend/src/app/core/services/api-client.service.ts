import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ApiClient {
    private readonly baseUrl = environment.apiUrl;
    private readonly http = inject(HttpClient);

    public get<T>(path: string, params?: HttpParams): Observable<T> {
        return this.http.get<T>(`${this.baseUrl}${path}`, { params });
    }

    public post<T>(path: string, body: unknown): Observable<T> {
        return this.http.post<T>(`${this.baseUrl}${path}`, body);
    }

    public put<T>(path: string, body: unknown): Observable<T> {
        return this.http.put<T>(`${this.baseUrl}${path}`, body);
    }

    public delete<T>(path: string): Observable<T> {
        return this.http.delete<T>(`${this.baseUrl}${path}`);
    }
}
